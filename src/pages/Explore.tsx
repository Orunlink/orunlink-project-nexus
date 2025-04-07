
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/ui/ProjectCard";
import Layout from "@/components/layout/Layout";
import BottomNav from "@/components/layout/BottomNav";

// Mock data
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
    isVideo: true,
  },
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
    title: "Music Player Redesign",
    description: "A modern music player with enhanced visualization and playlist features.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
    owner: {
      name: "Jason Brown",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    likes: 89,
    comments: 17,
  },
  {
    id: "8",
    title: "Photography Portfolio",
    description: "Minimalist portfolio website for professional photographers.",
    imageUrl: "https://images.unsplash.com/photo-1554080353-a576cf803bda",
    owner: {
      name: "Lisa Garcia",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    },
    likes: 143,
    comments: 21,
    isVideo: true,
  },
  {
    id: "9",
    title: "Recipe App Concept",
    description: "Mobile app for discovering and sharing recipes with social features.",
    imageUrl: "https://images.unsplash.com/photo-1505935428862-770b6f24f629",
    owner: {
      name: "Mark Wilson",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    likes: 76,
    comments: 14,
  },
];

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    setFilteredProjects(mockProjects);
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setFilteredProjects(mockProjects);
    } else {
      const filtered = mockProjects.filter(
        (project) =>
          project.title.toLowerCase().includes(term.toLowerCase()) ||
          project.description.toLowerCase().includes(term.toLowerCase())
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
        {filteredProjects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No projects found matching your search criteria.</p>
          </div>
        ) : (
          <>
            {/* Instagram-style grid layout */}
            <div className="grid grid-cols-3 gap-1">
              {/* Featured project (larger, spans 2 columns and rows) */}
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
