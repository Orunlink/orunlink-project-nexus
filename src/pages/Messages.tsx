
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Send, Search, ChevronLeft, Paperclip, Image, Mic, MoreVertical, User, Check, CheckCheck, Phone, Video } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    isGroup: true,
    name: "UI/UX Design Team",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "Alex: Hey, I'd like to collaborate on your project!",
    timestamp: "10:30 AM",
    unread: 3,
    members: [
      "https://randomuser.me/api/portraits/men/32.jpg",
      "https://randomuser.me/api/portraits/women/44.jpg",
      "https://randomuser.me/api/portraits/men/67.jpg",
      "https://randomuser.me/api/portraits/women/22.jpg",
    ]
  },
  {
    id: "2",
    isGroup: false,
    name: "Sarah Miller",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "Thanks for your feedback on my design",
    timestamp: "Yesterday",
    unread: 0,
  },
  {
    id: "3",
    isGroup: true,
    name: "Project Alpha",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    lastMessage: "David: I made some changes to the mockups",
    timestamp: "Yesterday",
    unread: 2,
    members: [
      "https://randomuser.me/api/portraits/men/67.jpg",
      "https://randomuser.me/api/portraits/women/22.jpg",
      "https://randomuser.me/api/portraits/men/32.jpg",
    ]
  },
  {
    id: "4",
    isGroup: false,
    name: "Emma Taylor",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    lastMessage: "When can we schedule a call to discuss the project?",
    timestamp: "Monday",
    unread: 0,
  },
];

// Mock messages for a selected conversation
const mockMessages = [
  {
    id: "m1",
    senderId: "1", // Alex
    senderName: "Alex",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "Hey everyone! I've set up this group for our UI/UX Design project.",
    timestamp: "10:30 AM",
    status: "read"
  },
  {
    id: "m2",
    senderId: "me",
    senderName: "You",
    text: "Great idea! We can share our progress and discuss ideas here.",
    timestamp: "10:32 AM",
    status: "read"
  },
  {
    id: "m3",
    senderId: "2", // Sarah
    senderName: "Sarah",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "I've been working on some wireframes for the homepage. Should I share them here?",
    timestamp: "10:35 AM",
    status: "read"
  },
  {
    id: "m4",
    senderId: "me",
    senderName: "You",
    text: "Yes please! That would be really helpful to see your progress.",
    timestamp: "10:38 AM",
    status: "read"
  },
  {
    id: "m5",
    senderId: "3", // David
    senderName: "David",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    text: "I can provide feedback on the wireframes once they're shared. I've been focusing on the user journey.",
    timestamp: "10:40 AM",
    status: "read"
  },
  {
    id: "m6",
    senderId: "4", // Emma
    senderName: "Emma",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    text: "I've also created some mockups for the mobile version. Let's coordinate to make sure our designs are consistent.",
    timestamp: "10:42 AM",
    status: "read"
  },
  {
    id: "m7",
    senderId: "me",
    senderName: "You",
    text: "That sounds great Emma! Let's set up a time to review everyone's work together.",
    timestamp: "10:45 AM",
    status: "delivered"
  },
];

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();
  const [showConversationList, setShowConversationList] = useState(!isMobile || !selectedConversation);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSelectConversation = (conversation: any) => {
    // Mark as read when selected
    const updatedConversations = conversations.map(c => 
      c.id === conversation.id ? { ...c, unread: 0 } : c
    );
    setConversations(updatedConversations);
    setSelectedConversation(conversation);
    
    // On mobile, show the conversation and hide the list
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setShowConversationList(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (messageText.trim() === "") return;
    
    const newMessage = {
      id: `m${messages.length + 1}`,
      senderId: "me",
      senderName: "You",
      text: messageText,
      timestamp: "Just now",
      status: "sending"
    };
    
    setMessages([...messages, newMessage]);
    setMessageText("");

    // Simulate message being sent and delivered
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
      
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
          )
        );
      }, 1000);
    }, 500);
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <div className="h-3 w-3 rounded-full bg-gray-300"></div>;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Layout hideNavbar>
      <div className="h-full max-w-6xl mx-auto">
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Conversations sidebar */}
          {(!isMobile || showConversationList) && (
            <div className={`${isMobile ? 'w-full' : 'w-1/3'} border-r border-gray-200 flex flex-col`}>
              <div className="p-4 border-b bg-white">
                <h2 className="text-xl font-bold mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {filteredConversations.length === 0 ? (
                  <p className="text-center py-6 text-gray-500">No conversations found</p>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id ? "bg-gray-50" : ""
                      }`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          {conversation.isGroup ? (
                            <div className="relative h-12 w-12">
                              <div className="absolute top-0 left-0 h-8 w-8 rounded-full overflow-hidden">
                                <img src={conversation.members?.[0]} alt="" className="h-full w-full object-cover" />
                              </div>
                              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full overflow-hidden border-2 border-white">
                                <img src={conversation.members?.[1]} alt="" className="h-full w-full object-cover" />
                              </div>
                            </div>
                          ) : (
                            <Avatar className="h-12 w-12">
                              <img src={conversation.avatar} alt={conversation.name} />
                            </Avatar>
                          )}
                          
                          {conversation.unread > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8B5CF6] text-xs text-white">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                        
                        <div className="ml-3 flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate">{conversation.name}</p>
                            <p className="text-xs text-gray-500">{conversation.timestamp}</p>
                          </div>
                          <p className={`text-sm truncate ${conversation.unread > 0 ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          )}
          
          {/* Chat area */}
          {(!isMobile || !showConversationList) && selectedConversation && (
            <div className={`${isMobile ? 'w-full' : 'w-2/3'} flex flex-col`}>
              {/* Chat header */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center">
                  {isMobile && (
                    <Button 
                      onClick={handleBackToList}
                      className="mr-2 p-1"
                      variant="ghost"
                      size="icon"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  )}
                  
                  {selectedConversation.isGroup ? (
                    <div className="relative h-10 w-10 mr-3">
                      <div className="absolute top-0 left-0 h-7 w-7 rounded-full overflow-hidden">
                        <img src={selectedConversation.members?.[0]} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="absolute bottom-0 right-0 h-7 w-7 rounded-full overflow-hidden border-2 border-white">
                        <img src={selectedConversation.members?.[1]} alt="" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  ) : (
                    <Avatar className="h-10 w-10 mr-3">
                      <img src={selectedConversation.avatar} alt={selectedConversation.name} />
                    </Avatar>
                  )}
                  
                  <div>
                    <p className="font-medium">{selectedConversation.name}</p>
                    {selectedConversation.isGroup && (
                      <p className="text-xs text-gray-500">
                        {selectedConversation.members?.length} members
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="text-gray-600">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-600">
                    <Video className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                      <DropdownMenuItem>View info</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Leave group</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isMe = message.senderId === "me";
                    const showSender = !isMe && (index === 0 || messages[index - 1].senderId !== message.senderId);
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isMe && showSender && (
                          <Avatar className="h-8 w-8 mr-2 mt-1">
                            <img src={message.avatar} alt={message.senderName} />
                          </Avatar>
                        )}
                        <div className={`max-w-xs ${!isMe && !showSender ? "ml-10" : ""}`}>
                          {!isMe && showSender && (
                            <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                          )}
                          <div className="flex items-end">
                            <div
                              className={`py-2 px-3 rounded-lg ${
                                isMe
                                  ? "bg-[#8B5CF6] text-white rounded-tr-none"
                                  : "bg-white border border-gray-200 rounded-tl-none"
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                            </div>
                            {isMe && (
                              <div className="ml-1">
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
              </ScrollArea>
              
              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white flex items-center">
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
                  className="text-gray-500 mr-1"
                >
                  <Image className="h-5 w-5" />
                </Button>
                
                <Input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 border-0"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                
                {messageText.trim() === "" ? (
                  <Button
                    type="button"
                    className="ml-2 bg-[#8B5CF6] text-white p-2 rounded-full hover:bg-[#7C4DFF]"
                    size="icon"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ml-2 bg-[#8B5CF6] text-white p-2 rounded-full hover:bg-[#7C4DFF]"
                    size="icon"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                )}
              </form>
            </div>
          )}

          {/* Empty state when no conversation is selected */}
          {(!isMobile || !showConversationList) && !selectedConversation && (
            <div className="w-full flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <User className="h-16 w-16 mx-auto text-gray-300" />
                <p className="text-gray-500 mt-4">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
