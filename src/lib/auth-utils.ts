import { DEFAULT_ROLES, isSuperAdminEmail, SUPER_ADMIN_FULL_ROLES } from "@/config/super-admins";

export type UserRole = 'super_admin' | 'company_admin' | 'employee';

export interface UserAccessProfile {
    role: UserRole;
    roles: UserRole[];
    active_role: UserRole;
    company_id: string | null;
}

/**
 * Resolves the definitive access profile for a user based on multiple inputs.
 * Priority: Master Email > User Metadata > DB Profile
 */
export function resolveUserAccess(
    email: string,
    metadata: any = {},
    dbProfile: any = null
): UserAccessProfile {
    const isMaster = isSuperAdminEmail(email);

    // 1. Determine Roles Array
    // Collect roles from everywhere
    let rolesSet = new Set<UserRole>(dbProfile?.roles || []);

    // Add roles from metadata (this is where Invitations/Assignments come in)
    if (metadata.role) rolesSet.add(metadata.role);
    if (metadata.roles && Array.isArray(metadata.roles)) {
        metadata.roles.forEach((r: any) => rolesSet.add(r));
    }

    // Master accounts are forced to have everything
    if (isMaster) {
        rolesSet.add('super_admin');
        SUPER_ADMIN_FULL_ROLES.forEach(r => rolesSet.add(r as UserRole));
    }

    // Everyone is an employee at base
    rolesSet.add('employee');

    const roles = Array.from(rolesSet);

    // 2. Determine Primary Role (The "Hierarchy" definition)
    let primaryRole: UserRole = 'employee';
    if (roles.includes('super_admin')) primaryRole = 'super_admin';
    else if (roles.includes('company_admin')) primaryRole = 'company_admin';

    // 3. Determine Active Role
    // Priority: Metadata Intent > Primary (Highest) Role
    // This handles the "I log in and want to be admin" flow immediately after invitation.
    let targetActiveRole: UserRole = metadata.active_role || metadata.role || primaryRole;

    // Fallback to DB active_role only if we have NO metadata intent
    if (!metadata.active_role && !metadata.role && dbProfile?.active_role) {
        targetActiveRole = dbProfile.active_role;
    }

    // CRITICAL: If you ARE an admin but your active_role is stuck in 'employee', 
    // we bump you to your Primary Role. This solves the "stale state" issue for tests.
    if (targetActiveRole === 'employee' && primaryRole !== 'employee') {
        targetActiveRole = primaryRole;
    }

    // Security: You can't be active in a role you don't possess
    if (!roles.includes(targetActiveRole)) {
        targetActiveRole = primaryRole;
    }

    // Special case for Absolute Master
    if (isMaster && targetActiveRole === 'employee') {
        targetActiveRole = 'super_admin';
    }

    // 4. Determine Company ID
    // Metadata (assignment) always beats DB if present
    const companyId = metadata.company_id || dbProfile?.company_id || null;

    return {
        role: primaryRole,
        roles: roles,
        active_role: targetActiveRole,
        company_id: companyId
    };
}
