
import { useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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
  status?: string;
  members?: { name: string; avatar: string }[];
}

const myProjects: Project[] = [
  {
    id: "101",
    title: "UI Design System",
    description: "A showcase of my work and skills using React and Tailwind CSS.",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    owner: {
      name: "Me",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    likes: 48,
    comments: 5,
    status: "new",
    members: [
      { name: "John Doe", avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
      { name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/23.jpg" }
    ]
  },
  {
    id: "102",
    title: "Mobile App",
    description: "Productivity tool for organizing tasks and projects with team collaboration features.",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b",
    owner: {
      name: "Me",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    likes: 29,
    comments: 8,
    isVideo: true,
    status: "wip",
    members: [
      { name: "John Doe", avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
      { name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/23.jpg" }
    ]
  },
];

const Projects = () => {
  const [activeTab, setActiveTab] = useState("my-projects");
  const navigate = useNavigate();
  
  const getStatusBadge = (status: string | undefined) => {
    if (status === 'new') {
      return <Badge className="bg-green-500 hover:bg-green-600">New</Badge>;
    } else if (status === 'wip') {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">WIP</Badge>;
    }
    return null;
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project-chat/${projectId}`);
  };

  return (
    <Layout hideNavbar={true} hideFooter={true}>
      <div className="max-w-md mx-auto p-4 pt-16 pb-20 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button className="bg-green-600 hover:bg-green-700 rounded-full">
            <Plus className="mr-1 h-5 w-5" />
            New Project
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button variant="outline" className="h-16 bg-gray-200 hover:bg-gray-300">
            <div className="flex flex-col items-center">
              <span className="font-semibold">Joint Projects</span>
              <span className="text-xs text-gray-500">Use invite code</span>
            </div>
          </Button>
          <Button variant="outline" className="h-16 bg-gray-200 hover:bg-gray-300">
            <div className="flex flex-col items-center">
              <span className="font-semibold">Find Partners</span>
              <span className="text-xs text-gray-500">Browse community</span>
            </div>
          </Button>
        </div>
        
        <h2 className="text-lg font-medium mb-4">Your Active Projects</h2>
        
        <div className="space-y-4">
          {myProjects.map((project) => (
            <Card 
              key={project.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleProjectClick(project.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex">
                    {project.members?.map((member, index) => (
                      <Avatar key={index} className={`w-10 h-10 border-2 border-white ${index > 0 ? "-ml-4" : ""}`}>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <h3 className="font-medium">{project.title}</h3>
                      <div className="ml-2">{getStatusBadge(project.status)}</div>
                    </div>
                    {project.members && (
                      <p className="text-sm text-gray-500">{project.members.length} Members</p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
