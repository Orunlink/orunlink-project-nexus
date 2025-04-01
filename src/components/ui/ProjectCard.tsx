
import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Share2, Bookmark, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
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

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
    setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(!isSaved);
  };

  return (
    <Link to={`/project/${id}`} className="orunlink-card block">
      <div className="relative">
        {isVideo ? (
          <video
            className="w-full h-48 object-cover"
            src={imageUrl}
            controls={false}
          />
        ) : (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover"
          />
        )}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-t-6 border-t-transparent border-l-10 border-l-white border-b-6 border-b-transparent ml-1"></div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <img
            src={owner.avatar}
            alt={owner.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm font-medium text-gray-700">{owner.name}</span>
        </div>
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className="flex items-center text-gray-500 hover:text-red-500"
            >
              <Heart
                className={`w-5 h-5 mr-1 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span className="text-xs">{currentLikes}</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-blue-500">
              <MessageSquare className="w-5 h-5 mr-1" />
              <span className="text-xs">{comments}</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-gray-700">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSave}
            className={`text-gray-500 ${isSaved ? "text-orunlink-purple" : "hover:text-orunlink-purple"}`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? "fill-orunlink-purple" : ""}`} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
