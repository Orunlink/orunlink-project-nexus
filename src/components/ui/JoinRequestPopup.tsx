import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { JoinRequest } from '@/services/api/types';

interface JoinRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  joinRequest: JoinRequest | null;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading?: boolean;
}

const JoinRequestPopup: React.FC<JoinRequestPopupProps> = ({
  isOpen,
  onClose,
  joinRequest,
  onAccept,
  onReject,
  isLoading = false
}) => {
  if (!joinRequest) return null;

  const handleAccept = () => {
    onAccept(joinRequest.id);
  };

  const handleReject = () => {
    onReject(joinRequest.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Request</DialogTitle>
          <DialogDescription>
            Someone wants to collaborate on your project
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 py-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={joinRequest.requester?.avatar_url} />
            <AvatarFallback>
              {joinRequest.requester?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">
              {joinRequest.requester?.full_name || 'Unknown User'}
            </p>
            <p className="text-sm text-muted-foreground">
              @{joinRequest.requester?.username || 'user'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Wants to join "{joinRequest.project?.title}"
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isLoading}
          >
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isLoading}
            className="bg-primary text-primary-foreground"
          >
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinRequestPopup;