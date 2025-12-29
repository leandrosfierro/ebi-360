-- 🛠️ Migración de Reparación - EBI 360
-- Esta migración asegura que la tabla 'profiles' tenga todas las columnas necesarias para el sistema de roles avanzado.

DO $$ 
BEGIN 
    -- 1. Asegurar columna 'role'
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role VARCHAR(50) DEFAULT 'employee';
    END IF;

    -- 2. Asegurar columna 'roles' (array de roles)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'roles') THEN
        ALTER TABLE profiles ADD COLUMN roles TEXT[] DEFAULT ARRAY['employee'];
    END IF;

    -- 3. Asegurar columna 'active_role'
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'active_role') THEN
        ALTER TABLE profiles ADD COLUMN active_role VARCHAR(50);
        -- Inicializar con el valor de 'role'
        UPDATE profiles SET active_role = role WHERE active_role IS NULL;
    END IF;

    -- 4. Asegurar columna 'admin_status'
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'admin_status') THEN
        ALTER TABLE profiles ADD COLUMN admin_status VARCHAR(20) DEFAULT 'active';
    END IF;

    -- 5. Asegurar columna 'last_active_at'
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_active_at') THEN
        ALTER TABLE profiles ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE;
    END IF;

END $$;
