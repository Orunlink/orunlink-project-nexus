
import Layout from "@/components/layout/Layout";
import ProfileSection from "@/components/ui/ProfileSection";
import ProjectCard from "@/components/ui/ProjectCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock user data
const mockUser = {
  id: "user1",
  name: "Alex Johnson",
  bio: "UI/UX Designer specializing in mobile interfaces and web applications",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  followers: 486,
  following: 124,
  projects: 15,
};

// Mock projects data
const mockProjects = [
  {
    id: "1",
    title: "Modern Mobile App UI Design",
    description: "A sleek mobile app interface with dark mode and customizable themes.",
    imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3",
    owner: {
      name: mockUser.name,
      avatar: mockUser.avatar,
    },
    likes: 124,
    comments: 23,
  },
  {
    id: "2",
    title: "E-commerce Website Redesign",
    description: "Complete redesign of an e-commerce platform with focus on UX improvement.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    owner: {
      name: mockUser.name,
      avatar: mockUser.avatar,
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
      name: mockUser.name,
      avatar: mockUser.avatar,
    },
    likes: 201,
    comments: 42,
  },
];

// Mock collaborations
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
  },
];

// Mock saved projects
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
  },
];

const Profile = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile section */}
        <ProfileSection
          name={mockUser.name}
          bio={mockUser.bio}
          avatar={mockUser.avatar}
          followers={mockUser.followers}
          following={mockUser.following}
          projects={mockUser.projects}
        />
        
        {/* Tabs for different project categories */}
        <div className="mt-8">
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-8">
              <TabsTrigger value="projects" className="flex-1">My Projects</TabsTrigger>
              <TabsTrigger value="collaborations" className="flex-1">Collaborations</TabsTrigger>
              <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    imageUrl={project.imageUrl}
                    owner={project.owner}
                    likes={project.likes}
                    comments={project.comments}
                    isVideo={project.isVideo}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="collaborations">
              {mockCollaborations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockCollaborations.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      description={project.description}
                      imageUrl={project.imageUrl}
                      owner={project.owner}
                      likes={project.likes}
                      comments={project.comments}
                      isVideo={project.isVideo}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No collaborations yet</h3>
                  <p className="text-gray-500">Join projects to start collaborating with others</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="saved">
              {mockSavedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockSavedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      description={project.description}
                      imageUrl={project.imageUrl}
                      owner={project.owner}
                      likes={project.likes}
                      comments={project.comments}
                      isVideo={project.isVideo}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved projects</h3>
                  <p className="text-gray-500">Save projects to view them later</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
