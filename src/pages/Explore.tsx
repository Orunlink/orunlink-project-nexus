import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/ui/ProjectCard";
import Layout from "@/components/layout/Layout";
import BottomNav from "@/components/layout/BottomNav";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const apiProjects = await api.getProjects();
        
        if (apiProjects && apiProjects.length > 0) {
          // Transform API projects to the format expected by ProjectCard
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
              likes: project.likes || 0,
              comments: project.comments || 0,
              isVideo: isVideo,
            };
          });
          setProjects(formattedProjects);
          setFilteredProjects(formattedProjects);
        } else {
          setProjects([]);
          setFilteredProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Failed to load projects",
          description: "Please try again later.",
          variant: "destructive",
        });
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  // Handle search activation
  const activateSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Handle search cancel
  const cancelSearch = () => {
    setIsSearching(false);
    setSearchTerm("");
    setFilteredProjects(projects);
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(term.toLowerCase()) ||
          project.description.toLowerCase().includes(term.toLowerCase()) ||
          project.owner.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  };

  // Featured project is larger (like Instagram explore page)
  const featuredProject = filteredProjects[0];
  const remainingProjects = filteredProjects.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Search header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-10 border-b border-gray-100 px-4 py-3">
        <div className={`flex items-center ${isSearching ? 'justify-between' : 'justify-center'}`}>
          {!isSearching && (
            <div className="text-xl font-semibold">Explore</div>
          )}
          
          <div className={`relative ${isSearching ? 'w-full' : 'w-auto'}`}>
            {isSearching ? (
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-10 py-2 w-full rounded-full border-gray-300"
                value={searchTerm}
                onChange={handleSearch}
              />
            ) : (
              <button 
                onClick={activateSearch}
                className="flex items-center p-2 rounded-full bg-gray-100 text-gray-500"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            
            {isSearching && (
              <>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                {searchTerm && (
                  <button 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
          
          {isSearching && (
            <button 
              className="ml-3 text-orunlink-purple font-medium"
              onClick={cancelSearch}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {/* Content area */}
      <div className="mt-16 mb-16 px-1 py-2 flex-1">
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {searchTerm ? "No projects found matching your search criteria." : "No projects available yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Instagram-style grid layout */}
            <div className="grid grid-cols-3 gap-1">
              {/* Featured project (larger, spans 2 columns and rows) */}
              {featuredProject && (
                <div className="col-span-2 row-span-2 relative aspect-square">
                  <a href={`/project/${featuredProject.id}`} className="block w-full h-full">
                    <img 
                      src={featuredProject.imageUrl} 
                      alt={featuredProject.title}
                      className="w-full h-full object-cover"
                    />
                    {featuredProject.isVideo && (
                      <div className="absolute top-2 right-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                          <path d="M4 4h16v16H4V4zm12 10l-4-2v4l4-2z" />
                        </svg>
                      </div>
                    )}
                  </a>
                </div>
              )}
              
              {/* Regular grid projects */}
              {remainingProjects.map((project, index) => (
                <div key={project.id} className="relative aspect-square">
                  <a href={`/project/${project.id}`} className="block w-full h-full">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    {project.isVideo && (
                      <div className="absolute top-1 right-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                          <path d="M4 4h16v16H4V4zm12 10l-4-2v4l4-2z" />
                        </svg>
                      </div>
                    )}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
};

export default Explore;