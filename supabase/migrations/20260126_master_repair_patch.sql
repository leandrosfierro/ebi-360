-- 🦅 Patch Maestro BS360 - v1.5 (ESTRENO TOTAL)
-- Fecha: 26 de enero de 2026 (19:50)

-- 1. Eliminar lo anterior para limpiar el terreno
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_super_admin();

-- 2. Función de verificación de Super Admin (Súper Segura)
-- Buscamos directamente en la tabla sin usar RLS para evitar recursión
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
    is_admin boolean;
BEGIN
    -- Obtenemos el perfil directamente
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'super_admin' OR 'super_admin' = ANY(roles))
    ) INTO is_admin;
    RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger ULTRA-TOLERANTE para nuevos usuarios
-- Este trigger nunca fallará, asegurando que 'generateLink' funcione siempre
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, roles, active_role, admin_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee'::user_role),
    ARRAY[COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee'::user_role)],
    COALESCE((NEW.raw_user_meta_data->>'active_role')::user_role, 'employee'::user_role),
    COALESCE(NEW.raw_user_meta_data->>'admin_status', 'active')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Si algo falla críticamente (ej. error de tipo enum), grabamos el perfil mínimo para no romper el flujo
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Re-aplicar Políticas Universales para Super Admins
DO $$ 
DECLARE 
    t text; 
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LOOP
        EXECUTE 'DROP POLICY IF EXISTS "SuperAdmin: Full Access" ON public.' || t;
        EXECUTE format('CREATE POLICY "SuperAdmin: Full Access" ON public.%I FOR ALL TO authenticated 
            USING (public.is_super_admin())', t);
    END LOOP;
END $$;

-- 5. Restaurar Perfiles Maestros con Identidad Completa
UPDATE public.profiles SET 
    full_name = 'Leandro Fierro', 
    role = 'super_admin', 
    roles = ARRAY['super_admin'::user_role, 'company_admin'::user_role, 'employee'::user_role],
    active_role = 'super_admin',
    admin_status = 'active'
WHERE email = 'leandro.fierro@bs360.com.ar';

UPDATE public.profiles SET 
    full_name = 'Carlos Menvielle', 
    role = 'super_admin', 
    roles = ARRAY['super_admin'::user_role, 'company_admin'::user_role, 'employee'::user_role],
    active_role = 'super_admin',
    admin_status = 'active'
WHERE email = 'carlos.menvielle@bs360.com.ar';

-- 6. Comentario de éxito
COMMENT ON FUNCTION public.is_super_admin IS 'Verificación blindada anti-recursión v1.5';
