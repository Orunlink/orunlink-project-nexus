-- CRITICAL SECURITY FIX: Update RLS policies to require authentication

-- Fix profiles table - require authentication for viewing user data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
FOR SELECT TO authenticated
USING (true);

-- Fix likes table - require authentication  
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
CREATE POLICY "Authenticated users can view likes" ON public.likes
FOR SELECT TO authenticated  
USING (true);

-- Fix comments table - require authentication
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;
CREATE POLICY "Authenticated users can view comments" ON public.comments
FOR SELECT TO authenticated
USING (true);

-- Create security definer function for chat role checking
CREATE OR REPLACE FUNCTION public.get_user_chat_role(p_user_id uuid, p_project_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  is_owner boolean;
BEGIN
  -- Check if user is project owner first
  SELECT EXISTS(
    SELECT 1 FROM projects 
    WHERE id = p_project_id AND owner_id = p_user_id
  ) INTO is_owner;
  
  -- If user is project owner, return 'creator'
  IF is_owner THEN
    RETURN 'creator';
  END IF;
  
  -- Otherwise check chat participants table
  SELECT role INTO user_role
  FROM chat_participants 
  WHERE user_id = p_user_id AND project_id = p_project_id;
  
  -- Return role or 'none' if not found
  RETURN COALESCE(user_role, 'none');
END;
$$;

-- Create function to auto-add project creator as chat participant
CREATE OR REPLACE FUNCTION public.ensure_project_creator_in_chat()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add project creator as chat participant with 'creator' role
  INSERT INTO chat_participants (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'creator')
  ON CONFLICT (project_id, user_id) DO UPDATE SET role = 'creator';
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically add project creator to chat
DROP TRIGGER IF EXISTS ensure_creator_in_chat ON projects;
CREATE TRIGGER ensure_creator_in_chat
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION ensure_project_creator_in_chat();

-- Add unique constraint to prevent duplicate participants
ALTER TABLE chat_participants 
ADD CONSTRAINT IF NOT EXISTS unique_project_user 
UNIQUE (project_id, user_id);