
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VerticalVideoCard from "@/components/ui/VerticalVideoCard";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Empty fallback when API fails
const fallbackProjects: any[] = [];

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [projects, setProjects] = useState(fallbackProjects);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const apiProjects = await api.getProjects();
        
        if (apiProjects && apiProjects.length > 0) {
          // Transform API projects to the format expected by VerticalVideoCard
          const formattedProjects = apiProjects.map(project => {
            // Better video detection
            const mediaUrl = project.main_image || (project.media_urls && project.media_urls[0]) || "";
            const isVideo = project.media_urls?.some(url => 
              url.toLowerCase().includes('.mp4') || 
              url.toLowerCase().includes('.webm') || 
              url.toLowerCase().includes('.mov') ||
              url.toLowerCase().includes('.avi') ||
              url.toLowerCase().includes('video')
            ) || false;
            
            return {
              id: project.id,
              title: project.title || "Untitled Project",
              description: project.description || "No description provided",
              imageUrl: mediaUrl,
              owner: project.owner || {
                name: "Unknown User",
                avatar: "",
              },
              likes: 0, // Real count will be fetched separately
              comments: 0, // Real count will be fetched separately
              isVideo: isVideo,
            };
          });
          setProjects(formattedProjects);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Failed to load projects",
          description: "Please try again later.",
          variant: "destructive",
        });
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const projectHeight = window.innerHeight;
    const newIndex = Math.floor(scrollPosition / projectHeight);
    
    if (newIndex !== activeIndex && newIndex < projects.length) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-black">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-white">
          <p>Loading creative projects...</p>
        </div>
      ) : (
        <div 
          className="flex-1 overflow-y-auto snap-y snap-mandatory"
          onScroll={handleScroll}
        >
          {projects.map((project, index) => (
            <div 
              key={project.id} 
              className="w-full h-screen snap-start snap-always relative"
            >
              <VerticalVideoCard
                project={project}
                isActive={index === activeIndex}
              />
            </div>
          ))}
        </div>
      )}

      <Header />
      <BottomNav />
    </div>
  );
};

export default Home;
