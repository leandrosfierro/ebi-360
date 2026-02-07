import { isSuperAdminEmail } from '@/config/super-admins';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * ============================================
 * AUTH-CORE: UNIFIED AUTHORIZATION ENGINE
 * ============================================
 * 
 * This module is THE SINGLE SOURCE OF TRUTH for all
 * role resolution and authorization checks.
 * 
 * Rules:
 * 1. All auth checks MUST use functions from this module
 * 2. Never check profile.role directly outside this module
 * 3. Master email whitelist always has precedence
 * 4. Roles array is the source of truth (not 'role' column)
 */

export type UserRole =
    | 'super_admin'
    | 'company_admin'
    | 'rrhh'
    | 'consultor_bs360'
    | 'employee';

export interface UserAuthContext {
    userId: string;
    email: string;
    roles: UserRole[];
    activeRole: UserRole;
    primaryRole: UserRole;
    companyId: string | null;
    isMasterAdmin: boolean;
}

/**
 * THE CANONICAL ROLE RESOLUTION FUNCTION
 * 
 * This function determines user permissions based on:
 * 1. Master email whitelist (highest priority)
 * 2. Roles array from profile (primary source)
 * 3. Active role (current session preference)
 * 
 * @returns UserAuthContext or null if not authenticated
 */
export async function getUserAuthContext(): Promise<UserAuthContext | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Use Admin Client to fetch profile data (bypass RLS for auth checks)
    // This is critical - RLS policies can block profile access during auth verification
    const supabaseAdmin = createAdminClient();
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('roles, active_role, role, company_id')
        .eq('id', user.id)
        .single();

    if (!profile) return null;

    // Check master whitelist
    const isMasterAdmin = isSuperAdminEmail(user.email || '');

    // Normalize roles (prefer roles array, fallback to role column for legacy)
    let roles: UserRole[] = [];

    if (profile.roles && Array.isArray(profile.roles) && profile.roles.length > 0) {
        roles = profile.roles as UserRole[];
    } else if (profile.role) {
        // Legacy fallback
        roles = [profile.role as UserRole];
    }

    // Master admins always have full privileges
    if (isMasterAdmin) {
        if (!roles.includes('super_admin')) {
            roles = ['super_admin', 'company_admin', 'employee'];
        }
    }

    // Ensure everyone has at least employee role
    if (!roles.includes('employee')) {
        roles.push('employee');
    }

    // Determine primary role (highest in hierarchy)
    const primaryRole: UserRole =
        roles.includes('super_admin') ? 'super_admin' :
            roles.includes('company_admin') ? 'company_admin' :
                roles.includes('rrhh') ? 'rrhh' :
                    roles.includes('consultor_bs360') ? 'consultor_bs360' :
                        'employee';

    // Determine active role (current session preference)
    let activeRole = (profile.active_role || primaryRole) as UserRole;

    // Security: Can only be active in a role you possess
    if (!roles.includes(activeRole)) {
        activeRole = primaryRole;
    }

    return {
        userId: user.id,
        email: user.email!,
        roles,
        activeRole,
        primaryRole,
        companyId: profile.company_id,
        isMasterAdmin
    };
}

/**
 * Authorization check with throwing behavior
 * 
 * Use this in server actions that require specific roles.
 * Throws error if user doesn't have access.
 * 
 * @param requiredRoles - One or more roles that grant access
 * @returns UserAuthContext if authorized
 * @throws Error if not authorized
 */
export async function requireRole(
    ...requiredRoles: UserRole[]
): Promise<UserAuthContext> {
    const context = await getUserAuthContext();

    if (!context) {
        throw new Error('Unauthorized: Authentication required');
    }

    // Master admins bypass all checks
    if (context.isMasterAdmin) {
        return context;
    }

    // Check if user has any of the required roles
    const hasAccess = requiredRoles.some(role => context.roles.includes(role));

    if (!hasAccess) {
        throw new Error(
            `Unauthorized: Requires one of: ${requiredRoles.join(', ')}. ` +
            `You have: ${context.roles.join(', ')}`
        );
    }

    return context;
}

/**
 * Non-throwing authorization check
 * 
 * Use this for conditional rendering or optional features.
 * 
 * @param requiredRoles - One or more roles that grant access
 * @returns true if user has access, false otherwise
 */
export async function canAccessRole(...requiredRoles: UserRole[]): Promise<boolean> {
    try {
        await requireRole(...requiredRoles);
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if user can perform admin actions in company context
 * 
 * This is a convenience function for the common case of
 * "can this user administer company resources?"
 */
export async function requireCompanyAdmin(): Promise<UserAuthContext> {
    return requireRole('company_admin', 'super_admin', 'rrhh', 'consultor_bs360');
}

/**
 * Check if user is a super admin
 * 
 * Use for platform-level operations (creating companies, etc)
 */
export async function requireSuperAdmin(): Promise<UserAuthContext> {
    return requireRole('super_admin');
}

/**
 * Get user context without throwing
 * 
 * Use in layouts or pages where you want to handle
 * unauthenticated state gracefully.
 */
export async function getOptionalAuthContext(): Promise<UserAuthContext | null> {
    try {
        return await getUserAuthContext();
    } catch {
        return null;
    }
}
