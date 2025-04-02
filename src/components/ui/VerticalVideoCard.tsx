
import { useState } from "react";
import { Heart, MessageSquare, Share2, Bookmark, Handshake } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

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
  const [currentLikes, setCurrentLikes] = useState(project.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Top purple header - fixed */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[#8B5CF6] z-10 rounded-b-lg flex justify-end items-center px-4">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <img 
            src="/lovable-uploads/f83e4b3e-e786-4333-90ed-d750a17c2dd1.png" 
            alt="Logo" 
            className="w-6 h-6 object-contain opacity-0" // Using the placeholder image with opacity 0 to match the design
          />
        </div>
      </div>

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

      {/* Side action buttons */}
      <div className="absolute right-4 bottom-32 flex flex-col space-y-6 items-center z-10">
        <div className="flex flex-col items-center">
          <button
            onClick={handleLike}
            className="w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-1"
          >
            <Heart
              className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </button>
          <span className="text-white text-xs">{currentLikes}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button className="w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-1">
            <MessageSquare className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs">{project.comments}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button className="w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-1">
            <Handshake className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs">Join</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button className="w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-1">
            <Share2 className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs">Share</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button
            onClick={handleSave}
            className="w-10 h-10 flex items-center justify-center bg-black bg-opacity-50 rounded-full mb-1"
          >
            <Bookmark
              className={`w-6 h-6 ${isSaved ? "fill-white" : ""} text-white`}
            />
          </button>
          <span className="text-white text-xs">Save</span>
        </div>
      </div>

      {/* Bottom user info - adjusted to account for new navigation position */}
      <div className="absolute bottom-24 left-4 right-20 z-10">
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="w-10 h-10 border-2 border-white">
            <img src={project.owner.avatar} alt={project.owner.name} />
          </Avatar>
          <span className="text-white font-medium">{project.owner.name}</span>
        </div>
        <p className="text-white text-sm mb-1">{project.title}</p>
        <p className="text-white text-xs opacity-80">{project.description}</p>
        <p className="text-white text-xs mt-2">
          <span className="font-medium">#creative</span> <span className="font-medium">#mind</span> <span className="font-medium">#love</span>
        </p>
      </div>

      {/* No separate bottom purple footer required as navigation is now in the footer */}
    </div>
  );
};

export default VerticalVideoCard;
