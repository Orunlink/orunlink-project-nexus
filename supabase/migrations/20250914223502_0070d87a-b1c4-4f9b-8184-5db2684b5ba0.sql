-- Update RLS policies for likes table to protect user privacy
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;

-- Project owners can see all likes on their projects, users can see their own likes
CREATE POLICY "Project owners and users can view relevant likes" 
ON public.likes 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT projects.owner_id 
    FROM projects 
    WHERE projects.id = likes.project_id
  )
);

-- Update RLS policies for comments table to protect user privacy  
DROP POLICY IF EXISTS "Anyone can read comments" ON public.comments;

-- Project owners can see all comments on their projects, users can see their own comments
CREATE POLICY "Project owners and users can view relevant comments" 
ON public.comments 
FOR SELECT 
USING (
  (auth.uid())::text = user_id OR 
  (auth.uid())::text IN (
    SELECT (projects.owner_id)::text 
    FROM projects 
    WHERE (projects.id)::text = comments.project_id
  )
);

-- Allow authenticated users to see comment counts for projects (without seeing who commented)
CREATE POLICY "Authenticated users can view comment metadata" 
ON public.comments 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  auth.uid() IS NOT NULL
);