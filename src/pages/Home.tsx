
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Home as HomeIcon, Search, Upload, User, Inbox, BookOpen } from "lucide-react";
import VerticalVideoCard from "@/components/ui/VerticalVideoCard";

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

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [projects, setProjects] = useState(mockProjects);
  const navigate = useNavigate();

  // Handle scroll to change active project
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const projectHeight = window.innerHeight;
    const newIndex = Math.floor(scrollPosition / projectHeight);
    
    if (newIndex !== activeIndex && newIndex < projects.length) {
      setActiveIndex(newIndex);
    }
  };

  // Navigation handlers
  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-black">
      {/* TikTok-style scrollable content */}
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

      {/* Top purple header - without rounded corners */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[#8B5CF6] z-10 flex items-center px-4">
        <div className="flex-1 flex justify-start">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/f83e4b3e-e786-4333-90ed-d750a17c2dd1.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain" 
            />
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <Link to="/messages">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-white">
              <Inbox className="w-6 h-6" />
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom navigation - without rounded corners */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#8B5CF6] z-20 flex justify-around items-center">
        <button 
          className="flex flex-col items-center text-white"
          onClick={() => navigateTo("/home")}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-white opacity-70 hover:opacity-100"
          onClick={() => navigateTo("/explore")}
        >
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">Explore</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-white opacity-70 hover:opacity-100"
          onClick={() => navigateTo("/create")}
        >
          <Upload className="w-6 h-6" />
          <span className="text-xs mt-1">Upload</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-white opacity-70 hover:opacity-100"
          onClick={() => navigateTo("/projects")}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-xs mt-1">Projects</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-white opacity-70 hover:opacity-100"
          onClick={() => navigateTo("/profile")}
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
