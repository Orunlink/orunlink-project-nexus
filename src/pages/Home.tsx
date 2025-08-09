
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
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const pageSize = 8;
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initialLoad = async () => {
      try {
        setIsLoading(true);
        const apiProjects = await api.getProjects({ limit: pageSize, offset: 0 });
        setProjects(
          (apiProjects || []).map(project => {
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
              owner: project.owner || { name: "Unknown User", avatar: "" },
              likes: project.likes || 0,
              comments: project.comments || 0,
              isVideo,
              ownerId: project.owner_id,
            };
          })
        );
        setHasMore((apiProjects || []).length === pageSize);
        setOffset((apiProjects || []).length);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Failed to load projects",
          description: "Please try again later.",
          variant: "destructive",
        });
        setProjects([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    initialLoad();
  }, [toast]);

  const fetchMore = async () => {
    if (isFetchingMore || !hasMore) return;
    try {
      setIsFetchingMore(true);
      const apiProjects = await api.getProjects({ limit: pageSize, offset });
      const formatted = (apiProjects || []).map(project => {
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
          owner: project.owner || { name: "Unknown User", avatar: "" },
          likes: project.likes || 0,
          comments: project.comments || 0,
          isVideo,
          ownerId: project.owner_id,
        };
      });
      setProjects(prev => [...prev, ...formatted]);
      setHasMore((apiProjects || []).length === pageSize);
      setOffset(prev => prev + (apiProjects || []).length);
    } catch (error) {
      console.error("Error loading more projects:", error);
      setHasMore(false);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const projectHeight = window.innerHeight;
    const newIndex = Math.floor(scrollPosition / projectHeight);

    if (newIndex !== activeIndex && newIndex < projects.length) {
      setActiveIndex(newIndex);
    }

    const nearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 2 * projectHeight;
    if (nearBottom) {
      await fetchMore();
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
                isActive={index === activeIndex || index === activeIndex + 1}
              />
            </div>
          ))}
          {isFetchingMore && (
            <div className="w-full h-24 flex items-center justify-center text-white">Loading more…</div>
          )}
        </div>
      )}

      <Header />
      <BottomNav />
    </div>
  );
};

export default Home;
