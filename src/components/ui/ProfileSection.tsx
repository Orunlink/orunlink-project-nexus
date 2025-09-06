import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProfileSectionProps {
  name: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  projects: number;
  username?: string;
  userId?: string;
  isOwnProfile?: boolean;
  onFollow?: () => void;
  isFollowing?: boolean;
  onFollowersUpdate?: (count: number) => void;
}

const ProfileSection = ({
  name,
  bio,
  avatar,
  followers,
  following,
  projects,
  username = "",
  userId,
  isOwnProfile = false,
  onFollow,
  isFollowing = false,
  onFollowersUpdate,
}: ProfileSectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(isFollowing);
  const [followerCount, setFollowerCount] = useState(followers);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    setIsFollowingUser(isFollowing);
    setFollowerCount(followers);
  }, [isFollowing, followers]);

  // Set up real-time subscription for follower count updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('follow-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${userId}`
        },
        async () => {
          // Refresh follower count when follows change
          try {
            const count = await api.getFollowerCount(userId);
            setFollowerCount(count);
            onFollowersUpdate?.(count);
          } catch (error) {
            console.error('Error updating follower count:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onFollowersUpdate]);

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
        // Force a re-render by updating the input value
        event.target.value = '';
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

  const handleFollow = async () => {
    if (!user || !userId || isFollowLoading) return;
    
    try {
      setIsFollowLoading(true);
      
      if (isFollowingUser) {
        await api.unfollowUser(userId);
        setIsFollowingUser(false);
        setFollowerCount(prev => prev - 1);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${name}`,
        });
      } else {
        await api.followUser(userId);
        setIsFollowingUser(true);
        setFollowerCount(prev => prev + 1);
        toast({
          title: "Following",
          description: `You are now following ${name}`,
        });
      }
      
      onFollow?.();
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setIsFollowLoading(false);
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
                <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                  <Upload className="h-4 w-4 text-primary-foreground" />
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
        
        <p className="text-muted-foreground text-sm mt-2 max-w-xs text-center px-6">
          {bio || (isOwnProfile ? "Add a bio to tell others about yourself..." : "")}
        </p>

        <div className="flex justify-center space-x-12 mt-4 mb-6">
          <div className="text-center">
            <div className="font-bold text-lg">{followerCount.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{following.toLocaleString()}</div>
            <div className="text-muted-foreground text-sm">Following</div>
          </div>
        </div>

        <div className="flex space-x-3 px-6 w-full">
          {isOwnProfile ? (
            <Button 
              className="flex-1"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button 
                className="flex-1 transition-colors animate-scale-in"
                variant={isFollowingUser ? "outline" : "default"}
                onClick={handleFollow}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? "..." : isFollowingUser ? 'Following' : 'Follow'}
              </Button>
              <Button variant="outline" className="flex-1">
                Message
              </Button>
            </>
          )}
          
          {isOwnProfile && (
            <Button 
              variant="outline"
              size="icon"
              onClick={() => navigate("/account-settings")}
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;