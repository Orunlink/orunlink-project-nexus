import Layout from "@/components/layout/Layout";
import ProfileSection from "@/components/ui/ProfileSection";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Project } from "@/services/api/types";
import { isVideoUrl } from "@/utils/videoUtils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type TabType = "all" | "projects" | "videos" | "collaborations";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch user profile and projects in parallel
        const [profile, projects, projectCount, followerCount, followingCount] = await Promise.all([
          api.getProfile(userId),
          api.getUserProjects(userId),
          api.getUserProjectCount(userId),
          api.getFollowerCount(userId),
          api.getFollowingCount(userId)
        ]);
        
        if (profile) {
          setUserData(profile);
        }
        
        setUserProjects(projects);
        setProjectsCount(projectCount);
        setFollowerCount(followerCount);
        setFollowingCount(followingCount);
        
        // Check if current user is following this user
        if (user && user.id !== userId) {
          const following = await api.isFollowing(user.id, userId);
          setIsFollowing(following);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleFollow = () => {
    // Follow functionality is now handled in ProfileSection component
    setIsFollowing(!isFollowing);
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
  };

  const handleFollowersUpdate = (count: number) => {
    setFollowerCount(count);
  };

  const getProjectImage = (project: Project) => {
    if (project.main_image) return project.main_image;
    if (project.media_urls && project.media_urls.length > 0) return project.media_urls[0];
    return "https://images.unsplash.com/photo-1551650975-87deedd944c3"; // Fallback image
  };

  const renderProjects = () => {
    const videos = userProjects.filter(p => isVideoUrl(getProjectImage(p)));
    const nonVideos = userProjects.filter(p => !isVideoUrl(getProjectImage(p)));
    
    switch (activeTab) {
      case "all":
        return userProjects;
      case "projects":
        return nonVideos;
      case "videos":
        return videos;
      case "collaborations":
        // Collaborations functionality to be implemented in future version
        return [];
      default:
        return userProjects;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userData) {
    return (
      <Layout>
        <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">User not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="relative">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold">{userData?.username || 'Profile'}</h1>
            <div className="w-10"></div>
          </div>
          
          <ProfileSection
            name={userData?.full_name || ""}
            bio={userData?.bio || ""}
            avatar={userData?.avatar_url || ""}
            followers={followerCount}
            following={followingCount}
            projects={projectsCount}
            username={userData?.username || ""}
            userId={userId}
            isOwnProfile={false}
            onFollow={handleFollow}
            isFollowing={isFollowing}
            onFollowersUpdate={handleFollowersUpdate}
          />
          
          <div className="flex justify-center border-b border-gray-100">
            <div className="flex space-x-6">
              <TabButton 
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
              >
                All
              </TabButton>
              <TabButton 
                active={activeTab === "projects"}
                onClick={() => setActiveTab("projects")}
              >
                Projects
              </TabButton>
              <TabButton 
                active={activeTab === "videos"}
                onClick={() => setActiveTab("videos")}
              >
                Videos
              </TabButton>
              <TabButton 
                active={activeTab === "collaborations"}
                onClick={() => setActiveTab("collaborations")}
              >
                Collabs
              </TabButton>
            </div>
          </div>
        </div>
        
        <div className="p-2">
          <div className="grid grid-cols-2 gap-2">
            {renderProjects().map((project) => {
              const imageUrl = getProjectImage(project);
              const isVideoFile = isVideoUrl(imageUrl);
              
              return (
                <div key={project.id} className="aspect-square overflow-hidden rounded-lg relative cursor-pointer"
                     onClick={() => navigate(`/project/${project.id}`)}>
                  <img 
                    src={imageUrl} 
                    alt={project.title} 
                    className="object-cover w-full h-full"
                  />
                  {isVideoFile && (
                    <div className="absolute top-2 right-2 bg-black/30 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Like count overlay */}
                  <div className="absolute bottom-2 left-2 bg-black/50 rounded px-2 py-1">
                    <span className="text-white text-xs font-medium">
                      {project.likes || 0} ❤️
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {renderProjects().length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const TabButton = ({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-1 text-sm font-medium relative ${
        active ? "text-orunlink-purple" : "text-gray-500"
      }`}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orunlink-purple"></div>
      )}
    </button>
  );
};

export default UserProfile;