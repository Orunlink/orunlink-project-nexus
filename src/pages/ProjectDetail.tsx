import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProjectCommentSection from "@/components/ui/ProjectCommentSection";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Calendar, 
  Users, 
  Tag,
  AlertCircle
} from "lucide-react";

// Mock project data
const mockProject = {
  id: "1",
  title: "Modern Mobile App UI Design",
  description: "A sleek mobile app interface with dark mode and customizable themes. The design focuses on intuitive navigation and user engagement. Implementing latest design trends including glassmorphism and neumorphism for a modern look and feel.",
  longDescription: "This project is a comprehensive UI design for a modern mobile application that includes both light and dark mode variations. The interface is designed with user experience as the top priority, ensuring intuitive navigation and clear information hierarchy.\n\nKey features of this UI design include:\n- Customizable themes with color palette options\n- Glassmorphism elements for depth and visual interest\n- Neumorphic components for interactive elements\n- Responsive layouts for various device sizes\n- Accessibility considerations for all users\n\nThe design process involved extensive user research, wireframing, prototyping, and usability testing to ensure the final product meets user needs and expectations.",
  imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3",
  images: [
    "https://images.unsplash.com/photo-1551650975-87deedd944c3",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    "https://images.unsplash.com/photo-1558655146-d09347e92766",
  ],
  owner: {
    id: "user1",
    name: "Alex Johnson",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    title: "UI/UX Designer",
  },
  likes: 124,
  comments: 23,
  createdAt: "2023-10-15",
  category: "Design",
  tags: ["UI Design", "Mobile App", "Dark Mode"],
  collaborators: [
    {
      id: "user2",
      name: "Sarah Miller",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      role: "Frontend Developer",
    },
    {
      id: "user3",
      name: "David Chen",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      role: "UX Researcher",
    },
  ],
  isAcceptingCollaborators: true,
};

// Mock comments
const mockComments = [
  {
    id: "comment1",
    author: {
      name: "Sarah Miller",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    content: "Love the design! The dark mode implementation is especially well done.",
    timestamp: "2 days ago",
  },
  {
    id: "comment2",
    author: {
      name: "David Chen",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    },
    content: "Great work on the UI elements. Would you be interested in collaborating on a similar project I'm working on?",
    timestamp: "1 day ago",
  },
  {
    id: "comment3",
    author: {
      name: "Emma Taylor",
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    },
    content: "The color scheme really stands out. What was your inspiration for this palette?",
    timestamp: "12 hours ago",
  },
];

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(mockProject.likes);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { toast } = useToast();

  // In a real app, we would fetch the project details based on projectId
  const project = mockProject;

  const handleLike = () => {
    setIsLiked(!isLiked);
    setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from favorites" : "Added to favorites",
      description: isSaved ? "Project removed from your saved items" : "Project saved to your profile",
    });
  };

  const handleRequestJoin = () => {
    toast({
      title: "Request sent",
      description: "Your request to join this project has been sent to the owner",
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/home" className="text-orunlink-purple hover:underline inline-flex items-center">
            ← Back to projects
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Project details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Image gallery */}
              <div className="relative">
                <img
                  src={project.images[activeImageIndex]}
                  alt={project.title}
                  className="w-full h-96 object-cover"
                />
                
                {/* Thumbnail navigation */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {project.images.map((image, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index === activeImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={project.owner.avatar}
                      alt={project.owner.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <Link to={`/profile/${project.owner.id}`} className="font-medium hover:text-orunlink-purple">
                        {project.owner.name}
                      </Link>
                      <div className="text-sm text-gray-500">{project.owner.title}</div>
                    </div>
                  </div>
                  <Button onClick={handleRequestJoin} className="bg-orunlink-purple hover:bg-orunlink-dark">
                    Request to Join
                  </Button>
                </div>

                <h1 className="text-2xl font-bold mb-3">{project.title}</h1>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className="bg-orunlink-light/10 text-orunlink-purple text-xs px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 whitespace-pre-line">{project.longDescription}</p>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={handleLike}
                      className="flex items-center text-gray-500 hover:text-red-500"
                    >
                      <Heart
                        className={`w-5 h-5 mr-1 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                      />
                      <span>{currentLikes}</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-blue-500">
                      <MessageSquare className="w-5 h-5 mr-1" />
                      <span>{project.comments}</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-gray-700">
                      <Share2 className="w-5 h-5 mr-1" />
                      <span>Share</span>
                    </button>
                  </div>
                  <button
                    onClick={handleSave}
                    className={`flex items-center ${isSaved ? "text-orunlink-purple" : "text-gray-500 hover:text-orunlink-purple"}`}
                  >
                    <Bookmark className={`w-5 h-5 mr-1 ${isSaved ? "fill-orunlink-purple" : ""}`} />
                    <span>{isSaved ? "Saved" : "Save"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Comments section */}
            <ProjectCommentSection comments={mockComments} />
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Project info card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Project Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Created on</div>
                    <div>{project.createdAt}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Tag className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Category</div>
                    <div>{project.category}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      {project.isAcceptingCollaborators 
                        ? "Open for collaboration" 
                        : "Not accepting collaborators"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Collaborators card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Collaborators</h3>
                <Users className="w-5 h-5 text-gray-500" />
              </div>
              
              <div className="space-y-4">
                {/* Project owner */}
                <div className="flex items-center">
                  <img
                    src={project.owner.avatar}
                    alt={project.owner.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <div className="font-medium">{project.owner.name}</div>
                    <div className="text-sm text-gray-500">Owner • {project.owner.title}</div>
                  </div>
                </div>
                
                {/* Other collaborators */}
                {project.collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center">
                    <img
                      src={collaborator.avatar}
                      alt={collaborator.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <div className="font-medium">{collaborator.name}</div>
                      <div className="text-sm text-gray-500">{collaborator.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Similar projects card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Similar Projects</h3>
              
              <div className="space-y-4">
                <div className="group flex items-center">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden mr-3 flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f"
                      alt="Similar project"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-orunlink-purple transition-colors">
                      E-commerce Website Redesign
                    </h4>
                    <p className="text-sm text-gray-500">by Sarah Miller</p>
                  </div>
                </div>
                
                <div className="group flex items-center">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden mr-3 flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1558655146-d09347e92766"
                      alt="Similar project"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-orunlink-purple transition-colors">
                      Smart Home IoT Dashboard
                    </h4>
                    <p className="text-sm text-gray-500">by David Chen</p>
                  </div>
                </div>
                
                <div className="group flex items-center">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden mr-3 flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1594882645126-14020914d58d"
                      alt="Similar project"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-orunlink-purple transition-colors">
                      Fitness Tracking App
                    </h4>
                    <p className="text-sm text-gray-500">by Emma Taylor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
