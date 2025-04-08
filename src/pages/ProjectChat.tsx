
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Plus, Send, Paperclip, Image, Mic, Settings } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import ChatSettings from "@/components/chat/ChatSettings";

// Mock data for a project chat
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  avatar?: string;
  text: string;
  timestamp: string;
  status: "sending" | "sent" | "delivered" | "read";
  isMe?: boolean;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
  role?: "admin" | "member";
}

interface ProjectChatData {
  id: string;
  title: string;
  isGroup: boolean;
  description?: string;
  avatar?: string;
  members: Member[];
  messages: Message[];
  wallpaper?: string;
}

// Mock project chat data
const getMockProjectChat = (projectId: string): ProjectChatData => {
  // This would come from an API in a real app
  return {
    id: projectId,
    title: projectId === "101" ? "UI Design System" : "Mobile App",
    isGroup: true,
    description: "Project discussion channel",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    wallpaper: "default",
    members: [
      { id: "1", name: "John Doe", avatar: "https://randomuser.me/api/portraits/men/22.jpg", online: true, role: "admin" },
      { id: "2", name: "Jane Smith", avatar: "https://randomuser.me/api/portraits/women/23.jpg", online: true, role: "member" },
      { id: "3", name: "Alex Johnson", avatar: "https://randomuser.me/api/portraits/men/32.jpg", role: "member" }
    ],
    messages: [
      {
        id: "m1",
        senderId: "1",
        senderName: "John",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        text: "Hey team! I've updated the design files with the newest components.",
        timestamp: "10:30 AM",
        status: "read"
      },
      {
        id: "m2",
        senderId: "me",
        senderName: "You",
        text: "Great! I'll check them out right away.",
        timestamp: "10:32 AM",
        status: "read",
        isMe: true
      },
      {
        id: "m3",
        senderId: "2",
        senderName: "Jane",
        avatar: "https://randomuser.me/api/portraits/women/23.jpg",
        text: "I think we should focus on improving the user flow for the onboarding process.",
        timestamp: "10:35 AM",
        status: "read"
      }
    ]
  };
};

const ProjectChat = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("");
  const [projectChat, setProjectChat] = useState<ProjectChatData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      // In a real app, fetch the project chat data from an API
      setProjectChat(getMockProjectChat(projectId));
    }
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projectChat?.messages]);

  const handleBack = () => {
    navigate("/projects");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !projectChat) return;
    
    const newMessage: Message = {
      id: `m${projectChat.messages.length + 1}`,
      senderId: "me",
      senderName: "You",
      text: messageText,
      timestamp: "Just now",
      status: "sending",
      isMe: true
    };
    
    setProjectChat({
      ...projectChat,
      messages: [...projectChat.messages, newMessage]
    });
    setMessageText("");

    // Simulate message being sent and delivered
    setTimeout(() => {
      setProjectChat(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
          )
        };
      });
      
      setTimeout(() => {
        setProjectChat(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
            )
          };
        });
      }, 1000);
    }, 500);
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <div className="h-3 w-3 rounded-full bg-gray-300"></div>;
      case 'sent':
        return <div className="h-3 w-3 text-gray-400">✓</div>;
      case 'delivered':
        return <div className="h-3 w-3 text-gray-400">✓✓</div>;
      case 'read':
        return <div className="h-3 w-3 text-white">✓✓</div>;
      default:
        return null;
    }
  };

  const handleUpdateSettings = (updatedChat: ProjectChatData) => {
    setProjectChat(updatedChat);
    setShowSettings(false);
    toast({
      title: "Settings updated",
      description: "Your changes have been saved successfully",
    });
  };

  const getWallpaperStyle = () => {
    if (!projectChat) return {};
    
    switch (projectChat.wallpaper) {
      case 'orunlink-gradient':
        return { backgroundImage: 'linear-gradient(to bottom right, #7C3AED, #9F7AEA)' };
      case 'orunlink-pattern':
        return { 
          backgroundColor: '#121212',
          backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(124, 58, 237, 0.15) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(124, 58, 237, 0.15) 2%, transparent 0%)',
          backgroundSize: '100px 100px' 
        };
      default:
        return { backgroundColor: '#121212' }; // Default black background
    }
  };

  if (!projectChat) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Layout hideNavbar hideFooter hideBottomNav hideHeader>
      <div className="flex flex-col h-screen">
        {/* Chat header */}
        <div className="flex items-center justify-between p-3 bg-orunlink-purple text-white">
          <div className="flex items-center">
            <Button 
              onClick={handleBack}
              className="p-1 mr-2"
              variant="ghost"
              size="icon"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>
            
            <div className="flex items-center">
              {projectChat.avatar && (
                <Avatar className="h-10 w-10 mr-3 border-2 border-white">
                  <AvatarImage src={projectChat.avatar} alt={projectChat.title} />
                  <AvatarFallback>{projectChat.title[0]}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="font-medium text-white">{projectChat.title}</p>
                <p className="text-xs text-gray-200">
                  {projectChat.isGroup ? `${projectChat.members.length} people` : "Online"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Users className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Messages area with configurable background */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-2"
          style={getWallpaperStyle()}
        >
          <div className="space-y-4">
            {projectChat.messages.map((message, index) => {
              const isMe = message.isMe || message.senderId === "me";
              const showSender = !isMe && (index === 0 || projectChat.messages[index - 1].senderId !== message.senderId);
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && showSender && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src={message.avatar} alt={message.senderName} />
                      <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-xs ${!isMe && !showSender ? "ml-10" : ""}`}>
                    {!isMe && showSender && (
                      <p className="text-xs text-gray-400 mb-1">{message.senderName}</p>
                    )}
                    <div className="flex items-end">
                      <div
                        className={`py-2 px-3 rounded-lg ${
                          isMe
                            ? "bg-orunlink-purple text-white rounded-br-none"
                            : "bg-white text-black rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      {isMe && (
                        <div className="ml-1 text-white">
                          {getMessageStatusIcon(message.status)}
                        </div>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      isMe ? "text-right text-gray-400" : "text-gray-400"
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Message input */}
        <div className="p-2 bg-orunlink-purple">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <Button 
              type="button"
              variant="ghost"
              size="icon"
              className="text-white"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <div className="flex-1 flex items-center bg-white rounded-full pl-3 pr-1">
              <Input
                type="text"
                placeholder="Send a public message..."
                className="border-0 focus-visible:ring-0 flex-1"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              {messageText.trim() === "" ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-500"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-500"
                  >
                    <Image className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-500"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  className="p-1 h-8 w-8 bg-orunlink-purple rounded-full"
                  size="icon"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Settings dialog for project chat */}
      {showSettings && projectChat && (
        <ChatSettings 
          projectChat={projectChat} 
          onClose={() => setShowSettings(false)} 
          onUpdate={handleUpdateSettings}
        />
      )}
    </Layout>
  );
};

export default ProjectChat;
