
import { useState } from "react";
import { User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

interface ProjectCommentSectionProps {
  comments: Comment[];
}

const ProjectCommentSection = ({ comments: initialComments }: ProjectCommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: {
        name: "You",
        avatar: "",
      },
      content: newComment,
      timestamp: "Just now",
    };

    setComments([comment, ...comments]);
    setNewComment("");
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
              placeholder="Add to the discussion..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full min-h-[80px] resize-none"
            />
            <div className="mt-2 flex justify-end">
              <Button 
                type="submit" 
                className="bg-orunlink-purple hover:bg-orunlink-dark"
                disabled={!newComment.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Post
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
                {comment.author.avatar ? (
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
                  <span className="font-medium">{comment.author.name}</span>
                  <span className="text-gray-500 text-sm ml-2">{comment.timestamp}</span>
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
