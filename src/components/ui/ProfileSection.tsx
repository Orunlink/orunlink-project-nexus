
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileSectionProps {
  name: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  projects: number;
  username?: string;
  isOwnProfile?: boolean;
}

const ProfileSection = ({
  name,
  bio,
  avatar,
  followers,
  following,
  projects,
  username = "",
  isOwnProfile = false,
}: ProfileSectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large", 
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Upload using the API service
      const result = await api.uploadFile('avatars', file);
      
      // Update user profile with new avatar URL
      if (user) {
        await updateProfile({ avatar_url: result.url });
      }

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been successfully updated.",
      });

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your profile picture.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="flex flex-col items-center pt-6 pb-4">
        <div className="mb-3 relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
            {avatar ? (
              <AvatarImage src={avatar} alt={name} />
            ) : (
              <AvatarFallback className="bg-gray-100">
                <User className="w-12 h-12 text-gray-400" />
              </AvatarFallback>
            )}
          </Avatar>
          
          {isOwnProfile && (
            <div className="absolute -bottom-1 -right-1">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="bg-orunlink-purple h-8 w-8 rounded-full flex items-center justify-center shadow-md">
                  <Upload className="h-4 w-4 text-white" />
                </div>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleUploadAvatar}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>
        
        {username && (
          <h2 className="text-lg font-bold text-center mt-1">@{username}</h2>
        )}
        
        <p className="text-gray-600 text-sm mt-2 max-w-xs text-center px-6">
          {bio || (isOwnProfile ? "Add a bio to tell others about yourself..." : "")}
        </p>

        <div className="flex justify-center space-x-12 mt-4 mb-6">
          <div className="text-center">
            <div className="font-bold text-lg">{followers.toLocaleString()}</div>
            <div className="text-gray-500 text-sm">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{following.toLocaleString()}</div>
            <div className="text-gray-500 text-sm">Following</div>
          </div>
        </div>

        <div className="flex space-x-3 px-6 w-full">
          {isOwnProfile ? (
            <Button 
              className="flex-1 bg-orunlink-purple hover:bg-orunlink-dark text-white font-medium"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button className="flex-1 bg-orunlink-purple hover:bg-orunlink-dark text-white font-medium">
                Follow
              </Button>
              <Button className="flex-1 bg-white text-gray-800 hover:bg-gray-100 border border-gray-200">
                Message
              </Button>
            </>
          )}
          
          {isOwnProfile && (
            <Button 
              variant="outline"
              size="icon"
              className="rounded-md border border-gray-200"
              onClick={() => navigate("/account-settings")}
            >
              <User className="h-5 w-5 text-gray-600" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
