
import { useState } from "react";
import { 
  Settings, 
  LogOut, 
  User, 
  Camera, 
  PenSquare, 
  Bell, 
  Shield, 
  HelpCircle 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProfileSettingsMenuProps {
  userId: string;
  avatar: string;
}

const ProfileSettingsMenu = ({ userId, avatar }: ProfileSettingsMenuProps) => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, this would call auth logout function
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    // Navigate to login page after logout
    navigate("/login");
  };

  const handleProfilePictureChange = () => {
    // Close the dialog
    setOpenDialog(null);
    // Show success toast
    toast({
      title: "Profile picture updated",
      description: "Your profile picture has been successfully updated.",
    });
  };

  const handleOpenDialog = (dialog: string) => {
    setOpenDialog(dialog);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/80 hover:bg-white backdrop-blur-sm shadow-sm">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatar} alt="Profile" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span>My Account</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleOpenDialog("profilePic")} className="cursor-pointer">
            <Camera className="mr-2 h-4 w-4" />
            <span>Change Profile Picture</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer">
            <PenSquare className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            <span>Notification Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            <span>Privacy & Security</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Picture Dialog */}
      <Dialog open={openDialog === "profilePic"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture or choose from the options below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6 py-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatar} alt="Profile" />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="picture" className="text-center text-sm text-gray-500">
                Choose a file from your device
              </label>
              <input
                id="picture"
                type="file"
                accept="image/*"
                className="w-full cursor-pointer rounded-md text-sm text-slate-500
                file:mr-4 file:rounded-md file:border-0
                file:bg-orunlink-purple file:px-4 file:py-2
                file:text-sm file:font-semibold file:text-white
                hover:file:bg-orunlink-dark"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancel</Button>
            <Button onClick={handleProfilePictureChange}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileSettingsMenu;
