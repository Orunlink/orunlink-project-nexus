import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import EnhancedCommentSection from "@/components/ui/EnhancedCommentSection";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { Project } from "@/services/api/types";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Calendar, 
  Users, 
  Tag,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

// Helper function to check if a URL is a video
const isVideo = (url: string): boolean => {
  return url.toLowerCase().includes('.mp4') || 
         url.toLowerCase().includes('.webm') || 
         url.toLowerCase().includes('.mov') || 
         url.toLowerCase().includes('.avi') ||
         url.toLowerCase().includes('video');
};


const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [joinRequestSent, setJoinRequestSent] = useState(false);
  const [isJoinRequestLoading, setIsJoinRequestLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      try {
        setIsLoading(true);
        const projectData = await api.getProjectById(projectId);
        
        if (projectData) {
          setProject(projectData);
          setCurrentLikes(projectData.likes);
          
          // Check if user has liked/saved this project
          if (user) {
            const status = await api.getUserLikeAndSaveStatus(projectId, user.id);
            setIsLiked(status.isLiked);
            setIsSaved(status.isSaved);
            
            // Check if user has already sent a join request
            const hasRequest = await api.checkExistingJoinRequest(projectId, user.id);
            setJoinRequestSent(hasRequest);
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user]);

  const handleLike = async () => {
    if (!user || !projectId) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to like projects",
        variant: "destructive",
      });
      return;
    }

    try {
      const newLikedState = await api.toggleLike(projectId);
      setIsLiked(newLikedState);
      setCurrentLikes(prev => newLikedState ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user || !projectId) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to save projects",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSavedState = await api.toggleSave(projectId);
      setIsSaved(newSavedState);
      toast({
        title: newSavedState ? "Project saved" : "Project unsaved",
        description: newSavedState ? "Project has been added to your saved items" : "Project has been removed from your saved items",
      });
    } catch (error) {
      console.error('Error toggling save:', error);
      toast({
        title: "Error",
        description: "Failed to update save status",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!project) return;
    
    try {
      await navigator.share({
        title: project.title,
        text: project.description,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Project link has been copied to your clipboard",
      });
    }
  };

  const handleJoinRequest = async () => {
    if (!user || !projectId || !project) return;

    setIsJoinRequestLoading(true);
    try {
      await api.createJoinRequest(projectId, user.id, project.owner_id || '');
      setJoinRequestSent(true);
      toast({
        title: "Join request sent",
        description: "Your request to join this project has been sent to the owner",
      });
    } catch (error) {
      console.error('Error sending join request:', error);
      toast({
        title: "Error",
        description: "Failed to send join request",
        variant: "destructive",
      });
    } finally {
      setIsJoinRequestLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Link to="/home">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const displayMedia = project.media_urls && project.media_urls.length > 0 
    ? project.media_urls 
    : project.main_image 
    ? [project.main_image] 
    : [];

  const currentMedia = displayMedia[activeImageIndex];
  const isCurrentVideo = currentMedia && isVideo(currentMedia);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/home" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Media */}
          <div className="space-y-4">
            {currentMedia && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                {isCurrentVideo ? (
                  <VideoPlayer 
                    src={currentMedia}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={currentMedia}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                )}
              </div>
            )}

            {/* Media Thumbnails */}
            {displayMedia.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {displayMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === activeImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    {isVideo(media) ? (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-xs">Video</span>
                      </div>
                    ) : (
                      <img
                        src={media}
                        alt={`${project.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <p className="text-muted-foreground">{project.description}</p>
            </div>

            {/* Owner Info */}
            <div className="flex items-center gap-3">
              <img
                src={project.owner.avatar || '/placeholder.svg'}
                alt={project.owner.name}
                className="w-12 h-12 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div>
                <h3 className="font-semibold">{project.owner.name}</h3>
                <p className="text-sm text-muted-foreground">Project Owner</p>
              </div>
            </div>

            {/* Project Meta */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              
              {project.category && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="w-4 h-4" />
                  <span>{project.category}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant={isLiked ? "default" : "outline"} 
                onClick={handleLike}
                className="flex items-center gap-2"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                {currentLikes}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {project.comments}
              </Button>
              
              <Button 
                variant={isSaved ? "default" : "outline"} 
                onClick={handleSave}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
              
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Join Request Button */}
            {user && project.owner_id !== user.id && (
              <Button
                onClick={handleJoinRequest}
                disabled={joinRequestSent || isJoinRequestLoading}
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                {joinRequestSent ? "Join Request Sent" : "Request to Join"}
              </Button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && projectId && (
          <div className="mt-8">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Comments</h2>
              </div>
              <EnhancedCommentSection projectId={projectId} isOpen={showComments} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectDetail;