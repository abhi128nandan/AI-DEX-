-- Set Admin Role for User
-- Run this in Supabase SQL Editor to grant admin access

-- STEP 1: Verify profiles table has role column
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';
-- Expected: role | text | 'user'::text

-- STEP 2: Check if your user has a profile
-- Replace 'your-email@example.com' with your actual email
SELECT 
  au.id as user_id,
  au.email,
  p.id as profile_id,
  p.username,
  p.role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'your-email@example.com';

-- STEP 3: If profile is missing, create it (replace YOUR_USER_ID and YOUR_EMAIL)
INSERT INTO profiles (id, username, role)
VALUES ('YOUR_USER_ID', 'YOUR_EMAIL', 'user')
ON CONFLICT (id) DO NOTHING;

-- STEP 4: Set admin role (replace YOUR_USER_ID with the ID from step 2)
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';

-- STEP 5: Verify admin role was set
SELECT id, username, role, created_at 
FROM profiles 
WHERE role = 'admin';

-- ALTERNATIVE: Set admin for currently authenticated user (if running from authenticated context)
-- UPDATE profiles SET role = 'admin' WHERE id = auth.uid();

-- STEP 6: Verify all users have profiles (should return 0)
SELECT COUNT(*) as users_without_profiles
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
