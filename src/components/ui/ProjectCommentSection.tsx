
import { useState, useEffect } from "react";
import { User, Send, ThumbsUp, ThumbsDown } from "lucide-react";
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

  const handleLikeComment = (commentId: string) => {
    // In a real app, this would call an API to like the comment
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: (comment.likes || 0) + 1,
          isLiked: true
        };
      }
      return comment;
    }));
  };

  const handleShowReplies = (commentId: string) => {
    // In a real app, this would fetch replies for the comment
    console.log("Show replies for comment:", commentId);
  };

  // Predefined emoji reactions
  const emojiReactions = ["😂", "🥰", "🔥", "❤️", "😄", "😮", "😌"];

  return (
    <div className="bg-white flex flex-col h-full">
      {/* Comments list */}
      <div className="flex-1 overflow-y-auto pb-16">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-start gap-3">
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
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {comment.author?.name || "Anonymous User"}
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                  <div className="flex items-center text-gray-500 mt-2 text-xs gap-4">
                    <span>{new Date(comment.created_at).toLocaleDateString(undefined, {
                      hour: 'numeric',
                      minute: 'numeric',
                    })}</span>
                    <button className="hover:text-gray-700">Reply</button>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button 
                    onClick={() => handleLikeComment(comment.id)}
                    className={`p-1 ${comment.isLiked ? "text-red-500" : "text-gray-400"}`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium">{comment.likes || 0}</span>
                  <button className="p-1 text-gray-400">
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* View replies button */}
              {(comment.replies_count || 0) > 0 && (
                <div 
                  className="ml-12 mt-2 text-gray-500 text-xs flex items-center cursor-pointer"
                  onClick={() => handleShowReplies(comment.id)}
                >
                  <div className="w-5 border-t border-gray-300"></div>
                  <span className="ml-2">View {comment.replies_count} replies</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Be the first to comment on this project!
          </div>
        )}
      </div>

      {/* Comment input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <Textarea
              placeholder={user ? "Add a comment..." : "Sign in to comment"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[36px] max-h-20 py-2 px-4 pr-12 resize-none rounded-full border-gray-200"
              disabled={!user}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment(e);
                }
              }}
            />
            <Button 
              type="submit" 
              onClick={handleSubmitComment}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-8 w-8 rounded-full bg-transparent hover:bg-gray-100"
              disabled={!newComment.trim() || !user || isLoading}
            >
              <Send className="w-4 h-4 text-orunlink-purple" />
            </Button>
          </div>
        </div>
        
        {/* Emoji reactions */}
        <div className="flex justify-between mt-2 px-2 py-1 overflow-x-auto">
          {emojiReactions.map((emoji, index) => (
            <button 
              key={index}
              className="text-xl hover:scale-125 transition-transform"
              onClick={() => setNewComment(prev => prev + emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCommentSection;
