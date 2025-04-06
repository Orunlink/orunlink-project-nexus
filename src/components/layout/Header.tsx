
import { Link } from "react-router-dom";
import { Inbox, Bell } from "lucide-react";
import OrunlinkLogo from "@/components/ui/OrunlinkLogo";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-[#8B5CF6] z-10 flex items-center px-4">
      <div className="flex-1 flex justify-start">
        <div className="flex items-center">
          <OrunlinkLogo size={isMobile ? 28 : 32} showText={false} color="white" />
        </div>
      </div>
      <div className="flex-1 flex justify-end gap-4">
        <Link to="/notifications">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-white">
            <Bell className="w-6 h-6" />
          </button>
        </Link>
        <Link to="/messages">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-white">
            <Inbox className="w-6 h-6" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Header;
