import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Send, Settings, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { ChatMessage, ChatParticipant } from "@/services/api/types";
import { supabase } from "@/integrations/supabase/client";

const ProjectChatReal = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
const [messageText, setMessageText] = useState("");
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [participants, setParticipants] = useState<ChatParticipant[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [project, setProject] = useState<any>(null);
const [isMember, setIsMember] = useState(false);
const [isOwner, setIsOwner] = useState(false);
const [joinPending, setJoinPending] = useState(false);
const [isRequestingJoin, setIsRequestingJoin] = useState(false);
const messagesEndRef = useRef<HTMLDivElement>(null);
const { user } = useAuth();
const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!projectId || !user) return;

    loadChatData();
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllChannels();
    };
  }, [projectId, user]);

  const loadChatData = async () => {
    if (!projectId || !user) return;

    try {
      setIsLoading(true);
      
      // Load project info
      const projectData = await api.getProjectById(projectId);
      setProject(projectData);
      
      // Load chat messages and participants
      const [messagesData, participantsData] = await Promise.all([
        api.getProjectChatMessages(projectId),
        api.getProjectChatParticipants(projectId)
      ]);

      setMessages(messagesData);
      setParticipants(participantsData);

      // Auto-add user as participant if not already added
      const isParticipant = participantsData.some(p => p.user_id === user.id);
      if (!isParticipant) {
        await api.addProjectChatParticipant(projectId, user.id);
        const updatedParticipants = await api.getProjectChatParticipants(projectId);
        setParticipants(updatedParticipants);
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast({
        title: "Error",
        description: "Failed to load chat data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!projectId) return;

    const channel = supabase
      .channel('project-chat-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          // Reload messages to get complete data with joins
          try {
            const messagesData = await api.getProjectChatMessages(projectId);
            setMessages(messagesData);
          } catch (error) {
            console.error('Error refreshing messages:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !projectId || !user) return;
    
    try {
      await api.sendProjectChatMessage(projectId, messageText.trim());
      setMessageText("");
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate(`/project/${projectId}`);
  };

  if (isLoading) {
    return (
      <Layout hideNavbar hideFooter hideBottomNav hideHeader>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout hideNavbar hideFooter hideBottomNav hideHeader>
        <div className="flex flex-col items-center justify-center h-screen">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">The project chat you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/home')}>
            Back to Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavbar hideFooter hideBottomNav hideHeader>
      <div className="flex flex-col h-screen">
        {/* Chat header */}
        <div className="flex items-center justify-between p-3 bg-primary text-primary-foreground">
          <div className="flex items-center">
            <Button 
              onClick={handleBack}
              className="p-1 mr-2"
              variant="ghost"
              size="icon"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3 border-2 border-primary-foreground">
                <AvatarImage src={project.main_image} alt={project.title} />
                <AvatarFallback>{project.title?.[0] || 'P'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{project.title}</p>
                <p className="text-xs opacity-80">
                  {participants.length} participant{participants.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Users className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 bg-background">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p className="text-lg mb-2">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isMe = message.sender_id === user?.id;
                const showSender = !isMe && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && showSender && (
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage src={message.sender?.avatar_url} alt={message.sender?.full_name || 'User'} />
                        <AvatarFallback>{message.sender?.full_name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-xs ${!isMe && !showSender ? "ml-10" : ""}`}>
                      {!isMe && showSender && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {message.sender?.full_name || 'Unknown User'}
                        </p>
                      )}
                      <div className="flex items-end">
                        <div
                          className={`py-2 px-3 rounded-lg ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted text-foreground rounded-tl-none"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                      <p className={`text-xs mt-1 text-muted-foreground ${
                        isMe ? "text-right" : ""
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Message input */}
        <div className="p-2 bg-background border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-muted rounded-full px-3 py-1">
              <Input
                type="text"
                placeholder="Type your message..."
                className="border-0 focus-visible:ring-0 flex-1 bg-transparent"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={!messageText.trim()}
              className="rounded-full"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectChatReal;