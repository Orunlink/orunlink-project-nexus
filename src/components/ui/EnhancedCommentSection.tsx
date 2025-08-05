import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { Textarea } from './textarea';
import { Send, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  project_id: string;
  author?: {
    name: string;
    avatar: string;
  };
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

interface EnhancedCommentSectionProps {
  projectId: string;
  isOpen: boolean;
}

const EnhancedCommentSection: React.FC<EnhancedCommentSectionProps> = ({
  projectId,
  isOpen
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && projectId) {
      fetchComments();
      const cleanup = subscribeToComments();
      return cleanup;
    }
  }, [isOpen, projectId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const fetchedComments = await api.getCommentsByProjectId(projectId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel('comments-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          // Fetch the complete comment with user data
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('user_id', payload.new.user_id)
              .single();

            if (profileData) {
              const newComment: Comment = {
                id: payload.new.id,
                content: payload.new.content,
                created_at: payload.new.created_at,
                user_id: payload.new.user_id,
                project_id: payload.new.project_id,
                author: {
                  name: profileData.full_name || profileData.username || 'Anonymous',
                  avatar: profileData.avatar_url || ''
                },
                user: profileData
              };
              setComments(prev => [...prev, newComment]);
            }
          } catch (error) {
            console.error('Error fetching new comment:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await api.addComment(projectId, user.id, newComment.trim());
      setNewComment('');
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author?.avatar || comment.user?.avatar_url} />
                <AvatarFallback>
                  {(comment.author?.name || comment.user?.full_name)?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.author?.name || comment.user?.full_name || 'Unknown User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{comment.user?.username || 'user'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                </div>
                
                <p className="text-sm leading-relaxed break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      {user ? (
        <div className="border-t p-4">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>
                {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmitComment();
                  }
                }}
              />
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Press Cmd/Ctrl + Enter to post
                </span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>Posting...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t p-4 text-center text-muted-foreground">
          <p>Please log in to post a comment</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedCommentSection;