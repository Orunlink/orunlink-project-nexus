import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, Send, Users } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useIsMobile } from '@/hooks/use-mobile';
import PrivateChat from '@/components/chat/PrivateChat';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

interface GroupChatItem {
  project_id: string;
  title: string;
  avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  participants_count: number;
}

const Messages = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChatItem[]>([]);
  const [activeTab, setActiveTab] = useState<'groups' | 'direct'>('groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
      loadGroupChats();
      const cleanup = setupRealtime();
      return () => { if (typeof cleanup === 'function') cleanup(); };
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setConversations([]);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupChats = async () => {
    if (!user) return;
    try {
      setLoadingGroups(true);
      const groups = await api.getUserGroupChats();
      setGroupChats(groups || []);
    } catch (e) {
      console.error('Error loading group chats', e);
    } finally {
      setLoadingGroups(false);
    }
  };

  const setupRealtime = () => {
    if (!user) return () => {};
    const channel = supabase
      .channel(`group-chats-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_participants', filter: `user_id=eq.${user.id}` },
        () => { loadGroupChats(); }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => { loadGroupChats(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowMobileChat(true);
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setShowMobileChat(false);
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Sidebar - Message List */}
        <div className={`${
          isMobile && showMobileChat ? 'hidden' : 'flex'
        } flex-col w-full ${isMobile ? '' : 'md:w-80 border-r border-border'}`}>
          
          {/* Header */}
          <div className="p-4 border-b border-border bg-background/95 backdrop-blur">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'groups' | 'direct')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="groups" className="text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Groups
                </TabsTrigger>
                <TabsTrigger value="direct" className="text-sm">Direct</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab}>
              <TabsContent value="groups" className="mt-0">
                {loadingGroups ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading group chats...</p>
                  </div>
                ) : groupChats.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {groupChats
                      .filter(chat => 
                        chat.title.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((chat) => (
                        <div
                          key={chat.project_id}
                          className="flex items-center p-4 rounded-lg hover:bg-muted cursor-pointer transition-all duration-200"
                          onClick={() => navigate(`/project/${chat.project_id}/chat`)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={chat.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {chat.title.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium truncate">
                                {chat.title}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {chat.participants_count} members
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {chat.last_message || 'No messages yet'}
                            </p>
                          </div>
                          {chat.unread_count > 0 && (
                            <div className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                              {chat.unread_count}
                            </div>
                          )}
                        </div>
                      ))
                  }
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">No group chats yet</h3>
                    <p className="text-sm text-muted-foreground">Join a project to start chatting</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="direct" className="mt-0">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading conversations...</p>
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {conversations
                      .filter(conv => 
                        conv.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedConversation?.id === conversation.id
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => handleSelectConversation(conversation)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conversation.participant_avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {conversation.participant_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium truncate">
                                {conversation.participant_name}
                              </p>
                              {conversation.last_message_time && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(conversation.last_message_time).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.last_message || 'No messages yet'}
                            </p>
                          </div>
                          {conversation.unread_count > 0 && (
                            <div className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                              {conversation.unread_count}
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">No direct messages yet</h3>
                    <p className="text-sm text-muted-foreground">Start a conversation with someone</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Content - Chat Area */}
        <div className={`${
          isMobile && !showMobileChat ? 'hidden' : 'flex'
        } flex-1 flex-col bg-background`}>
          {selectedConversation ? (
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-background/95 backdrop-blur">
                <div className="flex items-center">
                  {isMobile && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="mr-2"
                      onClick={handleBackToList}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.participant_avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedConversation.participant_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h2 className="text-lg font-semibold">
                      {selectedConversation.participant_name}
                    </h2>
                    <p className="text-sm text-muted-foreground">Active now</p>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1">
                <PrivateChat 
                  recipientId={selectedConversation.participant_id}
                  recipientName={selectedConversation.participant_name}
                  recipientAvatar={selectedConversation.participant_avatar}
                  onBack={handleBackToList}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;