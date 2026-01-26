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
    'leandro.fierro@bs360.com.ar',
    'carlos.menvielle@bs360.com.ar',
    'carlos.menvielle@gmail.com',
    'carlitosmenvielle@gmail.com',
    'leandrosfierro@gmail.com',
    'admin@bs360.com',
    'admin@bs360.com.ar',
    'soporte@bs360.com.ar',
];

/**
 * Verifica si un email tiene privilegios de super admin
 * 
 * @param email - Email del usuario a verificar
 * @returns true si el email está en la lista de super admins
 */
export function isSuperAdminEmail(email: string): boolean {
    if (!email) return false;

    // Normalización básica
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verificación directa
    if (SUPER_ADMIN_EMAILS.some(adminEmail => normalizedEmail === adminEmail.toLowerCase().trim())) {
        return true;
    }

    // 2. Manejo de alias de puntos en Gmail (leandro.fierro == leandrofierro)
    if (normalizedEmail.endsWith('@gmail.com')) {
        const [localPart] = normalizedEmail.split('@');
        const cleanLocalPart = localPart.replace(/\./g, '');
        const cleanEmail = `${cleanLocalPart}@gmail.com`;

        return SUPER_ADMIN_EMAILS.some(adminEmail => {
            if (!adminEmail.endsWith('@gmail.com')) return false;
            const [aLocal] = adminEmail.toLowerCase().split('@');
            return aLocal.replace(/\./g, '') === cleanLocalPart;
        });
    }

    // 3. Verificación por dominio corporativo y palabras clave
    const domain = normalizedEmail.split('@')[1];
    if (domain === 'bs360.com.ar' || domain === 'bs360.com') {
        const localPart = normalizedEmail.split('@')[0];
        const keywords = ['admin', 'leandro', 'carlos', 'soporte', 'developer'];
        if (keywords.some(kw => localPart.includes(kw))) {
            return true;
        }
    }

    return false;
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
