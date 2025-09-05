
import { useState } from "react";
import { ArrowLeft, Camera, PenSquare, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AccountSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
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

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Account Settings</h1>
          <div className="w-10"></div> {/* Empty div for spacing */}
        </div>

        <div className="p-4">
          <div className="flex items-center mb-6">
            <Avatar className="h-16 w-16 mr-4 border-2 border-white shadow-sm">
              {user?.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.full_name || user.username || "User"} />
              ) : (
                <AvatarFallback className="bg-gray-100">
                  <User className="w-8 h-8 text-gray-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">My Account</h2>
              <p className="text-gray-600 text-sm">{user?.full_name || user?.username || "User"}</p>
            </div>
          </div>

          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start px-2 py-6 h-auto" 
              onClick={() => setOpenDialog("profilePic")}
            >
              <Camera className="mr-4 h-5 w-5" />
              <span className="text-base font-medium">Change Profile Picture</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start px-2 py-6 h-auto"
              onClick={() => navigate("/edit-profile")}
            >
              <PenSquare className="mr-4 h-5 w-5" />
              <span className="text-base font-medium">Edit Profile</span>
            </Button>
            
            <Separator className="my-2" />
            
            <Button 
              variant="ghost" 
              className="w-full justify-start px-2 py-6 h-auto"
              onClick={() => navigate("/notification-settings")}
            >
              <Bell className="mr-4 h-5 w-5" />
              <span className="text-base font-medium">Notification Settings</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start px-2 py-6 h-auto"
              onClick={() => navigate("/privacy-security")}
            >
              <Shield className="mr-4 h-5 w-5" />
              <span className="text-base font-medium">Privacy & Security</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start px-2 py-6 h-auto"
              onClick={() => navigate("/help-support")}
            >
              <HelpCircle className="mr-4 h-5 w-5" />
              <span className="text-base font-medium">Help & Support</span>
            </Button>
            
            <Separator className="my-2" />
            
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center text-base">
                <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mr-4">
                  <span className="font-bold text-gray-800">4</span>
                </div>
                <span className="font-medium">Followers</span>
              </div>
              <div className="flex items-center text-base">
                <span className="font-medium">Following</span>
                <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center ml-4">
                  <span className="font-bold text-gray-800">6</span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start px-2 py-6 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-4 h-5 w-5" />
              <span className="text-base font-medium">Log out</span>
            </Button>
          </div>
        </div>

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
                <AvatarImage src={user?.avatar_url || ""} alt="Profile" />
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
      </div>
    </Layout>
  );
};

export default AccountSettings;
