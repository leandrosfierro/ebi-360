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
    let targetActiveRole: UserRole = metadata.active_role || metadata.role || primaryRole;

    // Fallback to DB active_role only if we have NO metadata intent
    // BUT: If the user is an admin, never let them land on 'employee' by default on login
    if (!metadata.active_role && !metadata.role && dbProfile?.active_role) {
        targetActiveRole = dbProfile.active_role;
    }

    // CRITICAL: If you ARE an admin but your active_role is 'employee' (either from DB or default),
    // we bump you to your Primary Role. This ensures admins don't land on a locked-down view.
    if (targetActiveRole === 'employee' && primaryRole !== 'employee') {
        targetActiveRole = primaryRole;
    }

    // Special case for Absolute Master: Always land on Super Admin if possible
    if (isMaster && targetActiveRole !== 'super_admin') {
        targetActiveRole = 'super_admin';
    }

    // Security check: cannot be active in a role you don't possess
    if (!roles.includes(targetActiveRole)) {
        targetActiveRole = primaryRole;
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
