-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.get_follower_count(user_id uuid)
RETURNS integer 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.follows WHERE following_id = user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_following_count(user_id uuid)
RETURNS integer 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.follows WHERE follower_id = user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_following(follower_id uuid, following_id uuid)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM public.follows WHERE follower_id = follower_id AND following_id = following_id);
END;
$$;