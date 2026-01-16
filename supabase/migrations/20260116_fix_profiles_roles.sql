-- Fix: Agregar columna roles array para soporte multi-rol
-- Fecha: 16 de enero de 2026

-- Agregar columna roles si no existe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roles user_role[] DEFAULT ARRAY['employee'::user_role];

-- Migrar datos existentes: convertir 'role' a array 'roles' para perfiles que no tengan la columna
UPDATE public.profiles 
SET roles = ARRAY[role::user_role] 
WHERE roles IS NULL OR roles = '{}';

-- Asegurar que active_role existe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_role user_role DEFAULT 'employee';

-- Actualizar active_role si está vacío
UPDATE public.profiles 
SET active_role = role 
WHERE active_role IS NULL;

-- Comentarios
COMMENT ON COLUMN public.profiles.roles IS 'Array de roles disponibles para el usuario (multi-rol)';
COMMENT ON COLUMN public.profiles.active_role IS 'Rol actualmente activo del usuario';
