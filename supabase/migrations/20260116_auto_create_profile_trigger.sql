-- Auto-creación de perfil cuando se crea un usuario en auth.users
-- Fecha: 16 de enero de 2026

-- Función que se ejecuta automáticamente al crear un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, roles, active_role, admin_status, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee'::user_role),
    COALESCE(
      ARRAY[(NEW.raw_user_meta_data->>'role')::user_role],
      ARRAY['employee'::user_role]
    ),
    COALESCE((NEW.raw_user_meta_data->>'active_role')::user_role, (NEW.raw_user_meta_data->>'role')::user_role, 'employee'::user_role),
    COALESCE(NEW.raw_user_meta_data->>'admin_status', 'active'),
    (NEW.raw_user_meta_data->>'company_id')::uuid
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    roles = COALESCE(EXCLUDED.roles, public.profiles.roles),
    active_role = COALESCE(EXCLUDED.active_role, public.profiles.active_role),
    company_id = COALESCE(EXCLUDED.company_id, public.profiles.company_id),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger que ejecuta la función
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Crea o actualiza automáticamente el perfil cuando se crea un usuario en auth.users';
