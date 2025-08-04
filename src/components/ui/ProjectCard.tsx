
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Share2, Bookmark, UserPlus } from "lucide-react";
import { Button } from "./button";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from "./VideoPlayer";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  isVideo?: boolean;
}

const ProjectCard = ({
  id,
  title,
  description,
  imageUrl,
  owner,
  likes,
  comments,
  isVideo = false,
}: ProjectCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [isRequestingJoin, setIsRequestingJoin] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Load initial like/save states
  useEffect(() => {
    if (user) {
      api.getUserLikeAndSaveStatus(id, user.id).then(({ isLiked, isSaved }) => {
        setIsLiked(isLiked);
        setIsSaved(isSaved);
      }).catch(error => {
        console.error('Error loading like/save status:', error);
      });
    }
  }, [id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like projects",
        variant: "destructive",
      });
      return;
    }

    try {
      const newLikeState = await api.toggleLike(id);
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

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save projects",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSaveState = await api.toggleSave(id);
      setIsSaved(newSaveState);
      toast({
        title: newSaveState ? "Project saved" : "Project unsaved",
        description: newSaveState ? "Added to your saved projects" : "Removed from saved projects",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update save status",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/project/${id}`);
      toast({
        title: "Link copied",
        description: "Project link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleJoinRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to request to join projects",
        variant: "destructive",
      });
      return;
    }

    if (user.id === owner.id) {
      toast({
        title: "Cannot join",
        description: "You cannot request to join your own project",
        variant: "destructive",
      });
      return;
    }

    setIsRequestingJoin(true);
    try {
      await api.createJoinRequest(id, user.id, owner.id);
      toast({
        title: "Request sent",
        description: "Your join request has been sent to the project owner",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send join request",
        variant: "destructive",
      });
    } finally {
      setIsRequestingJoin(false);
    }
  };

  return (
    <Link to={`/project/${id}`} className="bg-white rounded-md overflow-hidden shadow-sm">
      <div className="relative">
        <div className="pb-[100%] relative">
          <VideoPlayer
            src={imageUrl}
            muted={true}
            loop={true}
            controls={false}
            className="absolute inset-0 w-full h-full"
            onError={(error) => {
              console.error("Video error in ProjectCard:", error);
            }}
          />
        </div>
        {isVideo && (
          <div className="absolute top-2 right-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6 drop-shadow-lg">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <img
            src={owner.avatar}
            alt={owner.name}
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-sm font-medium text-gray-800">{owner.name}</span>
        </div>
        <h3 className="font-semibold text-base mb-1 line-clamp-1">{title}</h3>
        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLike}
              className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart
                className={`w-4 h-4 mr-1 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span className="text-xs">{currentLikes}</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-blue-500 transition-colors">
              <MessageSquare className="w-4 h-4 mr-1" />
              <span className="text-xs">{comments}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center text-gray-500 hover:text-green-500 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {user && user.id !== owner.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleJoinRequest}
                disabled={isRequestingJoin}
                className="h-6 px-2 text-xs"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Join
              </Button>
            )}
            <button
              onClick={handleSave}
              className={`text-gray-500 transition-colors ${isSaved ? "text-primary" : "hover:text-primary"}`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-primary" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
