-- Fix critical security issues: protect user profiles and group chat settings

-- Update profiles table RLS policy - currently ALL authenticated users can see ALL profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Only allow users to view their own profiles and profiles of users they follow or interact with
CREATE POLICY "Users can view relevant profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR
  -- Users can see profiles of people they follow
  auth.uid() IN (
    SELECT follower_id 
    FROM follows 
    WHERE following_id = profiles.user_id
  ) OR
  -- Users can see profiles of people who follow them
  auth.uid() IN (
    SELECT following_id 
    FROM follows 
    WHERE follower_id = profiles.user_id
  ) OR
  -- Users can see profiles of project owners whose projects they interact with
  auth.uid() IN (
    SELECT DISTINCT likes.user_id
    FROM likes
    JOIN projects ON projects.id = likes.project_id
    WHERE projects.owner_id = profiles.user_id
  ) OR
  -- Users can see profiles of people in their project chats
  auth.uid() IN (
    SELECT cp1.user_id
    FROM chat_participants cp1
    JOIN chat_participants cp2 ON cp1.project_id = cp2.project_id
    WHERE cp2.user_id = profiles.user_id
  )
);

-- Fix group chat settings exposure - currently ANYONE can view ALL group chat settings
DROP POLICY IF EXISTS "Anyone can view group chat settings" ON public.group_chat_settings;

-- Only allow chat participants to view group chat settings
CREATE POLICY "Chat participants can view group chat settings" 
ON public.group_chat_settings 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM chat_participants 
    WHERE project_id = group_chat_settings.project_id
  )
);

-- Ensure proper RLS is enabled on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_settings ENABLE ROW LEVEL SECURITY;