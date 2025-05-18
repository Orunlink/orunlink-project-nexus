
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VerticalVideoCard from "@/components/ui/VerticalVideoCard";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Fallback mock data when API fails or returns empty
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
  },
  {
    id: "2",
    title: "E-commerce Website Redesign",
    description: "Complete redesign of an e-commerce platform with focus on UX improvement.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    owner: {
      name: "Sarah Miller",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
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
      name: "David Chen",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    },
    likes: 201,
    comments: 42,
  },
];

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [projects, setProjects] = useState(mockProjects);
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
          const formattedProjects = apiProjects.map(project => ({
            id: project.id,
            title: project.title || "Untitled Project",
            description: project.description || "No description provided",
            imageUrl: project.main_image || "https://images.unsplash.com/photo-1551650975-87deedd944c3",
            owner: {
              name: "Project Owner",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            },
            likes: Math.floor(Math.random() * 200) + 50,
            comments: Math.floor(Math.random() * 50) + 5,
            isVideo: false,
          }));
          setProjects(formattedProjects);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Failed to load projects",
          description: "Using sample projects instead. Please try again later.",
          variant: "destructive",
        });
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
