
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
    navigate(`/project/${projectId}/chat`);
  };
  
  const handleCreateProject = () => {
    navigate("/create");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your projects...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
          <Button 
            onClick={handleCreateProject}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
        
        {projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card 
                key={project.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border border-border"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={project.main_image} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {project.title?.[0] || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description || "No description provided"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                    {project.category && (
                      <Badge variant="secondary" className="text-xs">
                        {project.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No projects yet</h3>
                <p className="text-muted-foreground">Create your first project to get started</p>
              </div>
              <Button onClick={handleCreateProject} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
