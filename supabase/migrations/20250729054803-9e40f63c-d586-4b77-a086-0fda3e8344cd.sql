-- Create chat_messages table for both project and private chats
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  project_id UUID NULL, -- For project group chats
  recipient_id UUID NULL, -- For private messages
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  file_url TEXT NULL,
  is_edited BOOLEAN DEFAULT false
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('join_request', 'comment', 'like', 'message', 'project_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  related_id UUID NULL, -- ID of related entity (project, comment, etc.)
  action_url TEXT NULL -- URL to navigate to when clicked
);

-- Create chat_participants table for group chat management
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
CREATE POLICY "Users can view project chat messages they participate in" 
ON public.chat_messages 
FOR SELECT 
USING (
  (project_id IS NOT NULL AND auth.uid() IN (
    SELECT user_id FROM chat_participants WHERE project_id = chat_messages.project_id
  )) OR
  (project_id IS NULL AND (auth.uid() = sender_id OR auth.uid() = recipient_id))
);

CREATE POLICY "Users can send chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can edit their own messages" 
ON public.chat_messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for chat_participants
CREATE POLICY "Users can view chat participants for projects they're in" 
ON public.chat_participants 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT owner_id FROM projects WHERE id = chat_participants.project_id
));

CREATE POLICY "Project owners can add participants" 
ON public.chat_participants 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT owner_id FROM projects WHERE id = project_id
));

-- Create triggers for timestamps
CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat and notifications
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.chat_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;