import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from "@/components/ui/ProjectCard";
import Navbar from "@/components/layout/Navbar";

// Updated type definition for projects
interface Project {
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
  isVideo?: boolean;
}

// Mock data
const myProjects: Project[] = [
  {
    id: "101",
    title: "My Personal Portfolio Website",
    description: "A showcase of my work and skills using React and Tailwind CSS.",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    owner: {
      name: "Me",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    likes: 48,
    comments: 5,
  },
  {
    id: "102",
    title: "Task Management App",
    description: "Productivity tool for organizing tasks and projects with team collaboration features.",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b",
    owner: {
      name: "Me",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    likes: 29,
    comments: 8,
    isVideo: true,
  },
];

const collaborationProjects: Project[] = [
  {
    id: "201",
    title: "Financial Dashboard",
    description: "Interactive dashboard for personal finance management and investment tracking.",
    imageUrl: "https://images.unsplash.com/photo-1579170053380-58064b2dee03",
    owner: {
      name: "Finance Group",
      avatar: "https://randomuser.me/api/portraits/women/29.jpg",
    },
    likes: 87,
    comments: 14,
  },
  {
    id: "202",
    title: "E-learning Platform",
    description: "Online education platform with courses, quizzes, and progress tracking.",
    imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8",
    owner: {
      name: "Education Team",
      avatar: "https://randomuser.me/api/portraits/men/54.jpg",
    },
    likes: 112,
    comments: 31,
  },
  {
    id: "203",
    title: "Weather App Redesign",
    description: "Modern interface for weather forecasting with location-based features.",
    imageUrl: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b",
    owner: {
      name: "Design Collective",
      avatar: "https://randomuser.me/api/portraits/women/62.jpg",
    },
    likes: 76,
    comments: 12,
    isVideo: true,
  },
];

const savedProjects: Project[] = [
  {
    id: "301",
    title: "AI Image Generator",
    description: "Machine learning tool that creates unique images based on text prompts.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    owner: {
      name: "AI Innovations",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    likes: 243,
    comments: 47,
  },
  {
    id: "302",
    title: "Minimalist E-commerce",
    description: "Clean, user-friendly online store design with focus on product presentation.",
    imageUrl: "https://images.unsplash.com/photo-1529400971008-f566de0e6dfc",
    owner: {
      name: "Design Masters",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    likes: 189,
    comments: 26,
  },
];

const Projects = () => {
  const [activeTab, setActiveTab] = useState("my-projects");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 pt-20">
        <h1 className="text-2xl font-bold mb-6">Projects</h1>
        
        <Tabs defaultValue="my-projects" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-projects">
            {myProjects.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">You haven't created any projects yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProjects.map((project) => (
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
            )}
          </TabsContent>
          
          <TabsContent value="collaborations">
            {collaborationProjects.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">You're not part of any collaborative projects yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborationProjects.map((project) => (
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
            )}
          </TabsContent>
          
          <TabsContent value="saved">
            {savedProjects.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">You haven't saved any projects yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProjects.map((project) => (
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Projects;
