-- Update the trigger function to respect existing profile data (from invitations)
-- or metadata provided during signup, instead of blindly inserting 'employee'.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 1. Check if a profile already exists for this user (e.g., created by an invitation system)
  --    If it exists, we DO NOTHING (or update specific fields if needed, but usually we trust the existing record).
  --    This prevents overwriting a 'super_admin' or 'company_admin' profile with a default 'employee' one.
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = new.id) THEN
    RETURN new;
  END IF;
  
  -- 2. If no profile exists, check if role/company data is provided in user_metadata
  --    This allows creating admins via the API with correct metadata.
  --    SECURITY NOTE: Standard signup forms should NOT include 'role' in metadata to prevent privilege escalation.
  --    However, for internal invites where metadata is trusted, this is useful.
  --    Ideally, we should rely on the invitation system creating the profile beforehand.
  
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    roles,
    active_role,
    company_id,
    admin_status
  )
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    -- Use provided role or default to 'employee'
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'employee'),
    -- If role is provided, add it to the roles array automatically
    CASE 
      WHEN new.raw_user_meta_data->>'role' IS NOT NULL 
      THEN ARRAY[(new.raw_user_meta_data->>'role')::user_role]
      ELSE ARRAY['employee'::user_role]
    END,
    -- Set active_role
    COALESCE((new.raw_user_meta_data->>'active_role')::user_role, 'employee'),
    -- Use provided company_id if present
    (new.raw_user_meta_data->>'company_id')::uuid,
    -- Use provided admin_status if present
    COALESCE(new.raw_user_meta_data->>'admin_status', 'active')
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
