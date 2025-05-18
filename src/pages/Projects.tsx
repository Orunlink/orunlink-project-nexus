
import { useState, useEffect } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import type { Project } from "@/services/api/types";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const fetchedProjects = await api.getProjects();
        // Filter to only show user's projects
        const userProjects = fetchedProjects.filter(
          project => project.owner_id === user?.id
        );
        setProjects(userProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to load your projects. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [user?.id, toast]);
  
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
  
  const handleCreateProject = () => {
    navigate("/create");
  };

  if (isLoading) {
    return (
      <Layout hideNavbar={true} hideFooter={true}>
        <div className="max-w-md mx-auto p-4 pt-16 pb-20 bg-gray-50 min-h-screen flex items-center justify-center">
          <p>Loading your projects...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavbar={true} hideFooter={true}>
      <div className="max-w-md mx-auto p-4 pt-16 pb-20 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button 
            className="bg-green-600 hover:bg-green-700 rounded-full"
            onClick={handleCreateProject}
          >
            <Plus className="mr-1 h-5 w-5" />
            New Project
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button variant="outline" className="h-16 bg-gray-200 hover:bg-gray-300">
            <div className="flex flex-col items-center">
              <span className="font-semibold">Join Projects</span>
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
          {projects.length > 0 ? (
            projects.map((project) => (
              <Card 
                key={project.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex">
                      <Avatar className="w-10 h-10 border-2 border-white">
                        <AvatarFallback>{project.title?.[0] || 'P'}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <h3 className="font-medium">{project.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">
                        {project.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You don't have any projects yet</p>
              <Button onClick={handleCreateProject} className="bg-orunlink-purple hover:bg-orunlink-dark">
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
