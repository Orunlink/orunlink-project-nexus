-- Fix the constraint syntax and add missing policies
DO $$
BEGIN
  -- Add unique constraint with correct syntax
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_project_user' 
    AND table_name = 'chat_participants'
  ) THEN
    ALTER TABLE chat_participants 
    ADD CONSTRAINT unique_project_user UNIQUE (project_id, user_id);
  END IF;
END$$;

-- Fix join_requests table policies to require authentication  
DROP POLICY IF EXISTS "Users can view their own join requests" ON public.join_requests;
CREATE POLICY "Authenticated users can view join requests" ON public.join_requests
FOR SELECT TO authenticated
USING (((auth.uid())::text = requester_id) OR ((auth.uid())::text = owner_id));

-- Add better notification policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Authenticated users can view their notifications" ON public.notifications
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Create function to insert notifications (for system use)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text, 
  p_message text,
  p_action_url text DEFAULT NULL,
  p_related_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, action_url, related_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_related_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;