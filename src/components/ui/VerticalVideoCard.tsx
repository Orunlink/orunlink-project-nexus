
import { useState } from "react";
import { Heart, MessageSquare, Share2, Bookmark, Handshake, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { shareProject } from "@/services/projectService";
import { useNavigate } from "react-router-dom";
import EnhancedCommentSection from "./EnhancedCommentSection";
import VideoPlayer from "./VideoPlayer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like this project",
        variant: "destructive",
      });
      return;
    }
    
    setIsLiked(!isLiked);
    setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
  };

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save this project",
        variant: "destructive",
      });
      return;
    }
    
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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view and post comments",
        variant: "destructive",
      });
      return;
    }
    
    setShowComments(!showComments);
  };

  const handleJoinClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Media content */}
      <div className="absolute inset-0">
        <VideoPlayer
          src={project.imageUrl}
          autoPlay={isActive && project.isVideo}
          muted={true}
          loop={true}
          controls={false}
          className="w-full h-full"
          onError={(error) => {
            console.error("Video error in VerticalVideoCard:", error);
          }}
        />
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

      {/* TikTok-style comments drawer */}
      <Drawer open={showComments} onOpenChange={setShowComments}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <DrawerTitle className="text-center text-base font-medium">{project.comments} comments</DrawerTitle>
            <DrawerClose className="absolute right-4 top-3 p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </DrawerClose>
          </DrawerHeader>
          <div className="px-0 py-0 overflow-auto max-h-[calc(85vh-60px)]">
        <EnhancedCommentSection projectId={project.id} isOpen={showComments} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default VerticalVideoCard;
