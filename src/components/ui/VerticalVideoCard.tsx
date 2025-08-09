
import { useState, useEffect } from "react";
import { Heart, MessageSquare, Share2, Bookmark, Handshake, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { api } from "@/services/api";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  owner: {
    name?: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  isVideo?: boolean;
  ownerId?: string;
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
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load initial like/save states
  useEffect(() => {
    if (user) {
      api.getUserLikeAndSaveStatus(project.id, user.id).then(({ isLiked, isSaved }) => {
        setIsLiked(isLiked);
        setIsSaved(isSaved);
      }).catch(error => {
        console.error('Error loading like/save status:', error);
      });
    }
  }, [project.id, user]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like this project",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newLikeState = await api.toggleLike(project.id);
      setIsLiked(newLikeState);
      setCurrentLikes(newLikeState ? currentLikes + 1 : currentLikes - 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save this project",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newSaveState = await api.toggleSave(project.id);
      setIsSaved(newSaveState);
      toast({
        title: newSaveState ? "Added to favorites" : "Removed from favorites",
        description: newSaveState ? "Project saved to your profile" : "Project removed from your saved items",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update save status",
        variant: "destructive",
      });
    }
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

const handleJoinClick = async () => {
  if (!user) {
    toast({
      title: "Sign in required",
      description: "Please sign in to request to join this project",
      variant: "destructive",
    });
    return;
  }

  if (project.ownerId && user.id === project.ownerId) {
    toast({
      title: "Cannot join",
      description: "You can’t join your own project",
    });
    return;
  }

  try {
    setIsJoining(true);
    const alreadyRequested = await api.checkExistingJoinRequest(project.id, user.id);
    if (alreadyRequested) {
      toast({
        title: "Request already sent",
        description: "Your join request is pending approval",
      });
      return;
    }

    const ownerId = project.ownerId;
    if (!ownerId) {
      toast({
        title: "Owner not found",
        description: "Could not find the project owner",
        variant: "destructive",
      });
      return;
    }

    await api.createJoinRequest(project.id, user.id, ownerId);
    toast({
      title: "Request sent",
      description: "The project owner has been notified",
    });
  } catch (error) {
    console.error('Error creating join request:', error);
    toast({
      title: "Error",
      description: "Failed to send join request",
      variant: "destructive",
    });
  } finally {
    setIsJoining(false);
  }
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
            className="w-7 h-7 flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleJoinClick}
            disabled={isJoining}
            aria-busy={isJoining}
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
            <AvatarImage src={project.owner?.avatar || '/placeholder.svg'} alt={project.owner?.name || 'Unknown User'} loading="lazy" />
            <AvatarFallback>{(project.owner?.name || 'U').charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-white font-medium text-sm">{project.owner?.name || 'Unknown User'}</span>
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
