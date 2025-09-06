-- Create follows table for the following system
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for follows table
CREATE POLICY "Users can view follows they're involved in" 
ON public.follows 
FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can manage their own follows" 
ON public.follows 
FOR ALL 
USING (auth.uid() = follower_id);

-- Add role column to chat_participants table
ALTER TABLE public.chat_participants 
ADD COLUMN role text NOT NULL DEFAULT 'member';

-- Create check constraint for valid roles
ALTER TABLE public.chat_participants 
ADD CONSTRAINT valid_role CHECK (role IN ('creator', 'admin', 'member'));

-- Add group chat settings table
CREATE TABLE public.group_chat_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  theme_color text DEFAULT '#6366f1',
  background_style text DEFAULT 'default',
  title text,
  description text,
  avatar_url text,
  notifications_enabled boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Enable RLS on group_chat_settings
ALTER TABLE public.group_chat_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_chat_settings
CREATE POLICY "Anyone can view group chat settings" 
ON public.group_chat_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only creators and admins can modify settings" 
ON public.group_chat_settings 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM chat_participants 
    WHERE project_id = group_chat_settings.project_id 
    AND role IN ('creator', 'admin')
  )
);

-- Create functions for follower counts
CREATE OR REPLACE FUNCTION public.get_follower_count(user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.follows WHERE following_id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_following_count(user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.follows WHERE follower_id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is following another user
CREATE OR REPLACE FUNCTION public.is_following(follower_id uuid, following_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM public.follows WHERE follower_id = follower_id AND following_id = following_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for updated_at on group_chat_settings
CREATE TRIGGER update_group_chat_settings_updated_at
BEFORE UPDATE ON public.group_chat_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for follows table
ALTER TABLE public.follows REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.follows;

-- Enable realtime for group_chat_settings table
ALTER TABLE public.group_chat_settings REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.group_chat_settings;