-- Run this query in your Supabase SQL Editor to make yourself a Super Admin

UPDATE profiles
SET 
  role = 'super_admin',
  active_role = 'super_admin',
  roles = ARRAY['super_admin', 'company_admin', 'employee']
WHERE email = 'leandro.fierro@bs360.com.ar';
