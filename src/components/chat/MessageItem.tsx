import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Heart, Smile, Reply } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageItemProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    sender: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    reactions?: Array<{
      emoji: string;
      users: string[];
    }>;
    reply_to?: {
      id: string;
      content: string;
      sender: {
        full_name: string;
      };
    };
  };
  isOwnMessage: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (messageId: string) => void;
}

const reactions = ['❤️', '😀', '😢', '😮', '😡', '👍', '👎'];

const MessageItem = ({ message, isOwnMessage, onReact, onReply }: MessageItemProps) => {
  const [showReactions, setShowReactions] = useState(false);

  const handleLongPress = () => {
    setShowReactions(true);
  };

  const handleReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowReactions(false);
  };

  const handleReply = () => {
    onReply(message.id);
    setShowReactions(false);
  };

  return (
    <div 
      className={`flex items-start space-x-3 mb-4 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
      onTouchStart={handleLongPress}
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
    >
      {!isOwnMessage && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage 
            src={message.sender.avatar_url} 
            alt={message.sender.full_name}
            className="object-cover"
          />
          <AvatarFallback className="text-xs">
            {message.sender.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex-1 max-w-xs ${isOwnMessage ? 'text-right' : ''}`}>
        {/* Reply preview */}
        {message.reply_to && (
          <div className={`mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-gray-300 text-sm ${isOwnMessage ? 'ml-auto' : ''}`}>
            <p className="text-gray-600 font-medium">{message.reply_to.sender.full_name}</p>
            <p className="text-gray-800 truncate">{message.reply_to.content}</p>
          </div>
        )}
        
        <div className={`relative p-3 rounded-2xl ${
          isOwnMessage 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-accent'
        }`}>
          {!isOwnMessage && (
            <p className="text-xs text-muted-foreground mb-1 font-medium">
              {message.sender.full_name}
            </p>
          )}
          <p className="text-sm break-words">{message.content}</p>
          
          {/* Message reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <div
                  key={index}
                  className="flex items-center bg-background/10 rounded-full px-2 py-1"
                >
                  <span className="text-xs mr-1">{reaction.emoji}</span>
                  <span className="text-xs">{reaction.users.length}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Reaction & Reply Popover */}
      <Popover open={showReactions} onOpenChange={setShowReactions}>
        <PopoverTrigger asChild>
          <div />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top">
          <div className="flex flex-col space-y-2">
            {/* Reactions */}
            <div className="flex space-x-1">
              {reactions.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
            
            {/* Reply button */}
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={handleReply}
            >
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageItem;