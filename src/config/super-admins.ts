/**
 * Configuración de Super Administradores - ESTRICTA
 * 26 de enero de 2026
 */

export const SUPER_ADMIN_EMAILS = [
    'leandro.fierro@bs360.com.ar',
    'carlos.menvielle@bs360.com.ar',
];

export function isSuperAdminEmail(email: string): boolean {
    if (!email) return false;
    const normalizedEmail = email.toLowerCase().trim();

    // Verificación directa contra la lista estricta
    return SUPER_ADMIN_EMAILS.some(adminEmail => normalizedEmail === adminEmail.toLowerCase().trim());
}

export const DEFAULT_ROLES = {
    SUPER_ADMIN: 'super_admin',
    COMPANY_ADMIN: 'company_admin',
    RRHH: 'rrhh',
    DIRECCION: 'direccion',
    CONSULTOR_BS360: 'consultor_bs360',
    EMPLOYEE: 'employee',
} as const;

export const SUPER_ADMIN_FULL_ROLES = [
    DEFAULT_ROLES.SUPER_ADMIN,
    DEFAULT_ROLES.COMPANY_ADMIN,
    DEFAULT_ROLES.EMPLOYEE,
] as const;
