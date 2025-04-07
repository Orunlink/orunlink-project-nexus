
import { useState } from "react";
import { Heart, MessageSquare, Share2, Bookmark, Handshake } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { shareProject } from "@/services/projectService";
import { useNavigate } from "react-router-dom";
import ProjectCommentSection from "./ProjectCommentSection";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  owner: {
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  isVideo?: boolean;
}

interface VerticalVideoCardProps {
  project: Project;
  isActive: boolean;
}

const VerticalVideoCard = ({ project, isActive }: VerticalVideoCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(project.likes);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from favorites" : "Added to favorites",
      description: isSaved ? "Project removed from your saved items" : "Project saved to your profile",
    });
  };

  const handleShare = async () => {
    try {
      const projectUrl = `${window.location.origin}/project/${project.id}`;
      const success = await shareProject(projectUrl, "project");
      
      if (success) {
        toast({
          title: "Project shared",
          description: navigator.share ? "Project shared successfully" : "Project link copied to clipboard",
        });
      } else {
        toast({
          title: "Share failed",
          description: "Unable to share this project. Try copying the URL manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sharing project:", error);
      toast({
        title: "Share failed",
        description: "Unable to share this project. Try copying the URL manually.",
        variant: "destructive",
      });
    }
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  const handleJoinClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Media content */}
      <div className="absolute inset-0">
        {project.isVideo ? (
          <video
            className="w-full h-full object-cover"
            src={project.imageUrl}
            autoPlay={isActive}
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Side action buttons - Made even smaller */}
      <div className="absolute right-3 bottom-32 flex flex-col space-y-3 items-center z-10">
        <div className="flex flex-col items-center">
          <button
            onClick={handleLike}
            className="w-7 h-7 flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-1"
          >
            <Heart
              className={`w-3 h-3 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </button>
          <span className="text-white text-xs">{currentLikes}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button 
            className="w-7 h-7 flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-1"
            onClick={handleCommentToggle}
          >
            <MessageSquare className="w-3 h-3 text-white" />
          </button>
          <span className="text-white text-xs">{project.comments}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button 
            className="w-7 h-7 flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-1"
            onClick={handleJoinClick}
          >
            <Handshake className="w-3 h-3 text-white" />
          </button>
          <span className="text-white text-xs">Join</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button 
            onClick={handleShare}
            className="w-7 h-7 flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-1"
          >
            <Share2 className="w-3 h-3 text-white" />
          </button>
          <span className="text-white text-xs">Share</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button
            onClick={handleSave}
            className="w-7 h-7 flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-1"
          >
            <Bookmark
              className={`w-3 h-3 ${isSaved ? "fill-white" : ""} text-white`}
            />
          </button>
          <span className="text-white text-xs">Save</span>
        </div>
      </div>

      {/* Bottom user info - adjusted to account for new navigation position */}
      <div className="absolute bottom-24 left-4 right-20 z-10">
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="w-8 h-8 border-2 border-white">
            <img src={project.owner.avatar} alt={project.owner.name} />
          </Avatar>
          <span className="text-white font-medium text-sm">{project.owner.name}</span>
        </div>
        <p className="text-white text-xs mb-1">{project.title}</p>
        <p className="text-white text-xs opacity-80">{project.description}</p>
        <p className="text-white text-xs mt-2">
          <span className="font-medium">#creative</span> <span className="font-medium">#mind</span> <span className="font-medium">#love</span>
        </p>
      </div>

      {/* Comments overlay */}
      {showComments && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-20 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Comments</h3>
              <button 
                onClick={handleCommentToggle}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProjectCommentSection projectId={project.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VerticalVideoCard;
