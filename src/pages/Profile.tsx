import Layout from "@/components/layout/Layout";
import ProfileSection from "@/components/ui/ProfileSection";
import { useState, useEffect } from "react";
import ProfileSettingsMenu from "@/components/ui/ProfileSettingsMenu";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";

type ProjectItem = {
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
  isVideo: boolean;
};

type TabType = "all" | "projects" | "videos" | "collaborations" | "saved";

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const profile = await api.getProfile(user.id);
        if (profile) {
          setUserData(profile);
        }
        
        setFollowerCount(0);
        setFollowingCount(0);
        setProjectsCount(0);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const mockProjects = [
    {
      id: "1",
      title: "Modern Mobile App UI Design",
      description: "A sleek mobile app interface with dark mode and customizable themes.",
      imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3",
      owner: {
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      likes: 124,
      comments: 23,
      isVideo: false,
    },
    {
      id: "2",
      title: "E-commerce Website Redesign",
      description: "Complete redesign of an e-commerce platform with focus on UX improvement.",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      owner: {
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      likes: 89,
      comments: 15,
      isVideo: true,
    },
    {
      id: "3",
      title: "Smart Home IoT Dashboard",
      description: "Dashboard for controlling smart home devices with analytics and automation.",
      imageUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766",
      owner: {
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      likes: 201,
      comments: 42,
      isVideo: false,
    },
  ];

  const mockCollaborations = [
    {
      id: "4",
      title: "Fitness Tracking App",
      description: "Mobile application for tracking workouts, nutrition, and health metrics.",
      imageUrl: "https://images.unsplash.com/photo-1594882645126-14020914d58d",
      owner: {
        name: "Emma Taylor",
        avatar: "https://randomuser.me/api/portraits/women/22.jpg",
      },
      likes: 156,
      comments: 28,
      isVideo: false,
    },
    {
      id: "5",
      title: "Cryptocurrency Exchange Platform",
      description: "Secure platform for trading cryptocurrencies with real-time market data.",
      imageUrl: "https://images.unsplash.com/photo-1639322537231-2f206e06af84",
      owner: {
        name: "Michael Lee",
        avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      },
      likes: 178,
      comments: 31,
      isVideo: false,
    },
  ];

  const mockSavedProjects = [
    {
      id: "6",
      title: "Social Media Analytics Tool",
      description: "Tool for tracking and analyzing social media performance across platforms.",
      imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7",
      owner: {
        name: "Olivia Wilson",
        avatar: "https://randomuser.me/api/portraits/women/57.jpg",
      },
      likes: 112,
      comments: 19,
      isVideo: false,
    },
    {
      id: "7",
      title: "3D Product Visualization",
      description: "Web-based platform for interactive 3D product visualization and customization.",
      imageUrl: "https://images.unsplash.com/photo-1535350356005-fd52b3b524fb",
      owner: {
        name: "James Brown",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      likes: 95,
      comments: 12,
      isVideo: false,
    },
  ];

  const mockVideos = [
    {
      id: "8",
      title: "Animation Workflow Tutorial",
      description: "Learn how to create smooth animations for your UI designs.",
      imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0",
      owner: {
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      likes: 245,
      comments: 37,
      isVideo: true,
    },
    {
      id: "9",
      title: "Design System Overview",
      description: "A walkthrough of creating a consistent design system for your products.",
      imageUrl: "https://images.unsplash.com/photo-1618004912476-29818d81ae2e",
      owner: {
        name: "Alex Johnson",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      likes: 189,
      comments: 24,
      isVideo: true,
    },
  ];

  const allProjects = [...mockProjects, ...mockVideos];

  const renderProjects = () => {
    switch (activeTab) {
      case "all":
        return allProjects;
      case "projects":
        return mockProjects.filter(p => !p.isVideo);
      case "videos":
        return mockVideos;
      case "collaborations":
        return mockCollaborations;
      case "saved":
        return mockSavedProjects;
      default:
        return allProjects;
    }
  };

  if (isLoading) {
    return (
      <Layout hideNavbar={true} hideFooter={true}>
        <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavbar={true} hideFooter={true}>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="relative">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <div className="w-10"></div>
            <div className="absolute top-3 right-4">
              <ProfileSettingsMenu userId={user?.id || ""} avatar={userData?.avatar_url || ""} />
            </div>
          </div>
          
          <ProfileSection
            name={userData?.full_name || ""}
            bio={userData?.bio || ""}
            avatar={userData?.avatar_url || ""}
            followers={followerCount}
            following={followingCount}
            projects={projectsCount}
            username={userData?.username || ""}
            isOwnProfile={true}
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
              <TabButton 
                active={activeTab === "saved"}
                onClick={() => setActiveTab("saved")}
              >
                Saved
              </TabButton>
            </div>
          </div>
        </div>
        
        <div className="p-2">
          <div className="grid grid-cols-2 gap-2">
            {renderProjects().map((project) => (
              <div key={project.id} className="aspect-square overflow-hidden rounded-lg relative">
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="object-cover w-full h-full"
                />
                {project.isVideo && (
                  <div className="absolute top-2 right-2 bg-black/30 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
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

export default Profile;
