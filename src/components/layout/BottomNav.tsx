
import { useNavigate, useLocation } from "react-router-dom";
import { Home as HomeIcon, Search, Upload, BookOpen, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const navigateTo = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-orunlink-dark to-orunlink-purple neo-glass z-20 flex justify-around items-center">
      <button 
        className={`flex flex-col items-center ${isActive("/home") ? "text-white" : "text-white/70 hover:text-white"}`}
        onClick={() => navigateTo("/home")}
      >
        <HomeIcon className="w-5 h-5" />
        <span className="text-xs mt-1">{!isMobile && "Home"}</span>
      </button>
      
      <button 
        className={`flex flex-col items-center ${isActive("/explore") ? "text-white" : "text-white/70 hover:text-white"}`}
        onClick={() => navigateTo("/explore")}
      >
        <Search className="w-5 h-5" />
        <span className="text-xs mt-1">{!isMobile && "Explore"}</span>
      </button>
      
      <button 
        className={`flex flex-col items-center ${isActive("/create") ? "text-white" : "text-white/70 hover:text-white"}`}
        onClick={() => navigateTo("/create")}
      >
        <Upload className="w-5 h-5" />
        <span className="text-xs mt-1">{!isMobile && "Upload"}</span>
      </button>
      
      <button 
        className={`flex flex-col items-center ${isActive("/projects") ? "text-white" : "text-white/70 hover:text-white"}`}
        onClick={() => navigateTo("/projects")}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-xs mt-1">{!isMobile && "Projects"}</span>
      </button>
      
      <button 
        className={`flex flex-col items-center ${isActive("/profile") ? "text-white" : "text-white/70 hover:text-white"}`}
        onClick={() => navigateTo("/profile")}
      >
        <User className="w-5 h-5" />
        <span className="text-xs mt-1">{!isMobile && "Profile"}</span>
      </button>
    </div>
  );
};

export default BottomNav;
