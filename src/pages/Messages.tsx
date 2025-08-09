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
    if (isMobile) setShowMobileChat(true);
    setActiveTab('direct');
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
    setActiveTab('groups');
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation =>
    conversation.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        <div className="flex h-[calc(100vh-8rem)]">
          {/* Conversation List */}
          <div className={`${
            isMobile 
              ? (showMobileChat ? 'hidden' : 'w-full') 
              : 'w-1/3'
          } border-r bg-card flex flex-col`}>
            <div className="p-4 border-b">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'groups' | 'direct')}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="groups">Group Chats</TabsTrigger>
                  <TabsTrigger value="direct">Direct</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lists */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'groups' ? (
                loadingGroups ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : groupChats.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No group chats yet</p>
                  </div>
                ) : (
                  groupChats
                    .filter(gc => gc.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((gc) => (
                      <div
                        key={gc.project_id}
                        onClick={() => navigate(`/project/${gc.project_id}/chat`)}
                        className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={gc.avatar} />
                            <AvatarFallback>{gc.title.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate">{gc.title}</h4>
                              <span className="text-xs text-muted-foreground">{gc.last_message_time}</span>
                            </div>
                            <p className={`text-sm text-muted-foreground truncate mt-1 ${gc.unread_count > 0 ? 'font-medium text-foreground' : ''}`}>
                              {gc.last_message || 'No messages yet'}
                            </p>
                          </div>
                          {gc.unread_count > 0 && (
                            <div className="min-w-[20px] h-5 px-2 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                              {gc.unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )
              ) : (
                loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Start a conversation by messaging someone!</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.participant_avatar} />
                          <AvatarFallback>{conversation.participant_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium truncate ${
                              conversation.unread_count > 0 ? 'font-semibold' : ''
                            }`}>
                              {conversation.participant_name}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {conversation.last_message_time}
                            </span>
                          </div>
                          <p className={`text-sm text-muted-foreground truncate mt-1 ${
                            conversation.unread_count > 0 ? 'font-medium text-foreground' : ''
                          }`}>
                            {conversation.last_message}
                          </p>
                        </div>
                        {conversation.unread_count > 0 && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${
            isMobile 
              ? (showMobileChat ? 'w-full' : 'hidden') 
              : 'flex-1'
          } flex flex-col`}>
            {selectedConversation ? (
              <PrivateChat
                recipientId={selectedConversation.participant_id}
                recipientName={selectedConversation.participant_name}
                recipientAvatar={selectedConversation.participant_avatar}
                onBack={handleBackToList}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose from your existing conversations or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;