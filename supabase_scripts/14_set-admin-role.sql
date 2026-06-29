-- Set Admin Role for User
-- Run this in your Supabase SQL Editor to grant admin access to your account.

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Find user ID by email dynamically
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'abhi128618@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User abhi128618@gmail.com not found in auth.users yet. Make sure to sign up on your website first, then re-run this script!';
  ELSE
    -- 2. Ensure profile exists and has the admin role
    INSERT INTO public.profiles (id, username, role)
    VALUES (v_user_id, 'Abhinandan', 'admin')
    ON CONFLICT (id) DO UPDATE 
    SET role = 'admin';
    
    RAISE NOTICE 'Successfully granted admin role to user: abhi128618@gmail.com';
  END IF;
END $$;

-- Verify admin role status in public profiles
SELECT id, username, role, created_at 
FROM public.profiles 
WHERE role = 'admin';
