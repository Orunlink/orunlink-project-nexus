-- Enable realtime for comments table
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- Enable realtime for join_requests table  
ALTER TABLE public.join_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE join_requests;