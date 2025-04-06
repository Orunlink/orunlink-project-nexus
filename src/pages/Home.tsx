import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import VerticalVideoCard from "@/components/ui/VerticalVideoCard";

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

      <Header />
      <BottomNav />
    </div>
  );
};

export default Home;
