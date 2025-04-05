
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/ui/ProjectCard";
import Navbar from "@/components/layout/Navbar";

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
];

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 pt-20">
        <h1 className="text-2xl font-bold mb-6">Explore Projects</h1>
        
        {/* Search bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search projects..."
            className="pl-10 w-full max-w-md"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        {/* Projects grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No projects found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
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
      </div>
    </div>
  );
};

export default Explore;
