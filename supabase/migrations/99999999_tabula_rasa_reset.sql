-- 💥 Tabula Rasa: Reset Total de Datos de Prueba
-- Este script limpia el sistema para auditoría, preservando solo a los Super Admins.

-- 1. Eliminar datos dependientes primero (Filtro por integridad referencial)
TRUNCATE TABLE public.results CASCADE;
TRUNCATE TABLE public.recommendations CASCADE;
TRUNCATE TABLE public.reports CASCADE;
TRUNCATE TABLE public.areas CASCADE;
TRUNCATE TABLE public.email_logs CASCADE;

-- 2. Eliminar Empresas (Iniciará cascada si se definieron bien los FK)
TRUNCATE TABLE public.companies CASCADE;

-- 3. Limpiar Perfiles EXCEPTUANDO Super Administradores Maestros
-- Nota: Usamos DELETE para filtrar, no TRUNCATE
DELETE FROM public.profiles
WHERE email NOT IN (
    'leandro.fierro@bs360.com.ar',
    'carlos.menvielle@bs360.com.ar',
    'carlitosmenvielle@gmail.com',
    'admin@bs360.com',
    'admin@bs360.com.ar',
    'soporte@bs360.com.ar'
);

-- 4. Resetear secuencia de IDs si fuera necesario (opcional)
-- ALTER SEQUENCE public.companies_id_seq RESTART WITH 1; 

-- 5. Comentario de éxito
COMMENT ON TABLE public.profiles IS 'Limpieza completada el 26 de enero de 2026. Lista para auditoría profunda.';
