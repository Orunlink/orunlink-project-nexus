import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PrivateChatMessage {
  id: string;
  sender_id: string;
  recipient_id?: string;
  content: string;
  created_at: string;
  sender?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

interface PrivateChatProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  onBack: () => void;
}

const PrivateChat: React.FC<PrivateChatProps> = ({
  recipientId,
  recipientName,
  recipientAvatar,
  onBack
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<PrivateChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !recipientId) return;

    loadMessages();
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllChannels();
    };
  }, [user, recipientId]);

  const loadMessages = async () => {
    if (!user || !recipientId) return;

    try {
      setLoading(true);
      const messagesData = await api.getPrivateMessages(recipientId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user || !recipientId) return;

    const channel = supabase
      .channel(`private-chat-${user.id}-${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `and(project_id=is.null,or(and(sender_id=eq.${user.id},recipient_id=eq.${recipientId}),and(sender_id=eq.${recipientId},recipient_id=eq.${user.id})))`,
        },
        async (payload) => {
          const newMessage = payload.new as PrivateChatMessage;
          
          // Fetch sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('user_id', newMessage.sender_id)
            .single();

          if (profile) {
            newMessage.sender = profile;
          }

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await api.sendPrivateMessage(recipientId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-lg border">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarImage src={recipientAvatar} />
          <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold">{recipientName}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender_id === user?.id ? 'flex-row-reverse' : ''
            }`}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={
                message.sender_id === user?.id 
                  ? user.avatar_url 
                  : recipientAvatar
              } />
              <AvatarFallback>
                {message.sender_id === user?.id 
                  ? user.full_name?.charAt(0) || user.username?.charAt(0) || '?'
                  : recipientName.charAt(0)
                }
              </AvatarFallback>
            </Avatar>
            <div
              className={`max-w-[70%] ${
                message.sender_id === user?.id ? 'text-right' : ''
              }`}
            >
              <div
                className={`rounded-lg p-3 ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PrivateChat;