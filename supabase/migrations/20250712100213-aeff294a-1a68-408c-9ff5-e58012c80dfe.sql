-- Create profiles for any existing auth users that don't have profiles
INSERT INTO public.profiles (user_id, username, full_name)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'username', au.email),
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.email)
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.user_id IS NULL;