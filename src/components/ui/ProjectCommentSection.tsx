
import { useState, useEffect } from "react";
import { User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addComment, getCommentsByProjectId, Comment } from "@/services/projectService";
import { supabase } from "@/integrations/supabase/client";

interface ProjectCommentSectionProps {
  projectId: string;
}

const ProjectCommentSection = ({ projectId }: ProjectCommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const authListener = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      const commentsData = await getCommentsByProjectId(projectId);
      setComments(commentsData);
    };

    fetchComments();

    // Set up realtime subscription for new comments
    const channel = supabase
      .channel('public:comments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `project_id=eq.${projectId}` },
        (payload) => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setIsLoading(true);
      const result = await addComment(projectId, user.id, newComment);
      if (result) {
        setNewComment("");
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully.",
        });
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4">Discussion</h3>
      
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-grow">
            <Textarea
              placeholder={user ? "Add to the discussion..." : "Sign in to comment"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full min-h-[80px] resize-none"
              disabled={!user}
            />
            <div className="mt-2 flex justify-end">
              <Button 
                type="submit" 
                className="bg-orunlink-purple hover:bg-orunlink-dark"
                disabled={!newComment.trim() || !user || isLoading}
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3 py-3 border-t border-gray-100">
              <div className="shrink-0">
                {comment.author?.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{comment.author?.name || "Anonymous User"}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Be the first to comment on this project!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCommentSection;
