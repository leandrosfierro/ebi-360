/**
 * Configuración de Super Administradores
 * 
 * Este archivo centraliza la configuración de usuarios con privilegios de super admin.
 * Los emails listados aquí tendrán acceso automático a todas las funcionalidades
 * administrativas de la plataforma.
 */

/**
 * Lista de emails autorizados como Super Administradores
 * 
 * IMPORTANTE: 
 * - Mantener esta lista actualizada
 * - Usar emails corporativos verificados
 * - No compartir este archivo en repositorios públicos
 */
export const SUPER_ADMIN_EMAILS = [
    'leandro.fierro@bs360.com',
    'leandrofierro@gmail.com',
    'admin@bs360.com',
];

/**
 * Verifica si un email tiene privilegios de super admin
 * 
 * @param email - Email del usuario a verificar
 * @returns true si el email está en la lista de super admins
 */
export function isSuperAdminEmail(email: string): boolean {
    const normalizedEmail = email.toLowerCase().trim();

    return SUPER_ADMIN_EMAILS.some(adminEmail =>
        normalizedEmail === adminEmail.toLowerCase() ||
        normalizedEmail.includes(adminEmail.toLowerCase())
    );
}

/**
 * Configuración de roles por defecto
 */
export const DEFAULT_ROLES = {
    SUPER_ADMIN: 'super_admin',
    COMPANY_ADMIN: 'company_admin',
    RRHH: 'rrhh',
    DIRECCION: 'direccion',
    CONSULTOR_BS360: 'consultor_bs360',
    EMPLOYEE: 'employee',
} as const;

/**
 * Array completo de roles para super admins
 */
export const SUPER_ADMIN_FULL_ROLES = [
    DEFAULT_ROLES.SUPER_ADMIN,
    DEFAULT_ROLES.COMPANY_ADMIN,
    DEFAULT_ROLES.EMPLOYEE,
] as const;
