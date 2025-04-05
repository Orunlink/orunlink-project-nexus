
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Send, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    user: {
      name: "Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    lastMessage: "Hey, I'd like to collaborate on your project!",
    timestamp: "10:30 AM",
    unread: true,
  },
  {
    id: "2",
    user: {
      name: "Sarah Miller",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    lastMessage: "Thanks for your feedback on my design",
    timestamp: "Yesterday",
    unread: false,
  },
  {
    id: "3",
    user: {
      name: "David Chen",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    },
    lastMessage: "I made some changes to the mockups",
    timestamp: "Yesterday",
    unread: false,
  },
  {
    id: "4",
    user: {
      name: "Emma Taylor",
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    },
    lastMessage: "When can we schedule a call to discuss the project?",
    timestamp: "Monday",
    unread: false,
  },
];

// Mock messages for a selected conversation
const mockMessages = [
  {
    id: "m1",
    senderId: "1", // Alex
    text: "Hey, I'd like to collaborate on your project!",
    timestamp: "10:30 AM",
  },
  {
    id: "m2",
    senderId: "me",
    text: "Hi Alex! Thanks for reaching out. What aspects are you interested in?",
    timestamp: "10:32 AM",
  },
  {
    id: "m3",
    senderId: "1",
    text: "I'm a UI/UX designer with experience in mobile apps. I think I could help improve the user flow.",
    timestamp: "10:35 AM",
  },
  {
    id: "m4",
    senderId: "me",
    text: "That sounds great! I've been looking for someone with your skills. Would you be available to chat more about it tomorrow?",
    timestamp: "10:38 AM",
  },
  {
    id: "m5",
    senderId: "1",
    text: "Absolutely! I'm free in the afternoon. How about 2 PM?",
    timestamp: "10:40 AM",
  },
];

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelectConversation = (conversation: any) => {
    // Mark as read when selected
    const updatedConversations = conversations.map(c => 
      c.id === conversation.id ? { ...c, unread: false } : c
    );
    setConversations(updatedConversations);
    setSelectedConversation(conversation);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (messageText.trim() === "") return;
    
    const newMessage = {
      id: `m${messages.length + 1}`,
      senderId: "me",
      text: messageText,
      timestamp: "Just now",
    };
    
    setMessages([...messages, newMessage]);
    setMessageText("");
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 pt-20 h-[calc(100vh-80px)]">
        <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Conversations sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
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
                        <Avatar className="h-12 w-12">
                          <img src={conversation.user.avatar} alt={conversation.user.name} />
                        </Avatar>
                        {conversation.unread && (
                          <span className="absolute top-0 right-0 w-3 h-3 bg-orunlink-purple rounded-full"></span>
                        )}
                      </div>
                      
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{conversation.user.name}</p>
                          <p className="text-xs text-gray-500">{conversation.timestamp}</p>
                        </div>
                        <p className={`text-sm truncate ${conversation.unread ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Chat area */}
          <div className="w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <Avatar className="h-10 w-10">
                    <img src={selectedConversation.user.avatar} alt={selectedConversation.user.name} />
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">{selectedConversation.user.name}</p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${
                        message.senderId === "me" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.senderId !== "me" && (
                        <Avatar className="h-8 w-8 mr-2">
                          <img src={selectedConversation.user.avatar} alt={selectedConversation.user.name} />
                        </Avatar>
                      )}
                      <div
                        className={`py-2 px-4 rounded-lg max-w-xs ${
                          message.senderId === "me"
                            ? "bg-orunlink-purple text-white"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === "me" ? "text-white/75" : "text-gray-500"
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="ml-2 bg-orunlink-purple text-white p-2 rounded-full hover:bg-orunlink-dark"
                    disabled={messageText.trim() === ""}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
