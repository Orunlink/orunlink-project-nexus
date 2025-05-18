
import { Link } from "react-router-dom";
import { Inbox, Bell, LogIn, Shield } from "lucide-react";
import OrunlinkLogo from "@/components/ui/OrunlinkLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const isMobile = useIsMobile();
  const { isAuthenticated, user, signOut } = useAuth();
  
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-orunlink-dark to-orunlink-purple neo-glass z-10 flex items-center px-4">
      <div className="flex-1 flex justify-start">
        <div className="flex items-center">
          <Link to="/home">
            <OrunlinkLogo size={isMobile ? 28 : 32} showText={false} color="white" />
          </Link>
        </div>
      </div>
      <div className="flex-1 flex justify-end gap-4 items-center">
        {isAuthenticated ? (
          <>
            <Link to="/notifications">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <Bell className="w-6 h-6" />
              </button>
            </Link>
            <Link to="/messages">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <Inbox className="w-6 h-6" />
              </button>
            </Link>
          </>
        ) : (
          <Link to="/login">
            <Button variant="ghost" className="flex items-center text-white hover:bg-white/10">
              <LogIn className="mr-2 h-4 w-4" />
              <span>Login</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
