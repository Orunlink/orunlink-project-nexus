
import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Share2, Bookmark } from "lucide-react";

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
    <Link to={`/project/${id}`} className="bg-white rounded-md overflow-hidden shadow-sm">
      <div className="relative">
        <div className="pb-[100%] relative">
          {isVideo ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={imageUrl}
              muted
              loop
            />
          ) : (
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
        {isVideo && (
          <div className="absolute top-2 right-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M4 4h16v16H4V4zm12 10l-4-2v4l4-2z" />
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
              className="flex items-center text-gray-500 hover:text-red-500"
            >
              <Heart
                className={`w-4 h-4 mr-1 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span className="text-xs">{currentLikes}</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-blue-500">
              <MessageSquare className="w-4 h-4 mr-1" />
              <span className="text-xs">{comments}</span>
            </button>
          </div>
          <button
            onClick={handleSave}
            className={`text-gray-500 ${isSaved ? "text-orunlink-purple" : "hover:text-orunlink-purple"}`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-orunlink-purple" : ""}`} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
