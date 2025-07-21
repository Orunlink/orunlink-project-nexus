import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';
import JoinRequestPopup from './JoinRequestPopup';
import { JoinRequest } from '@/services/api/types';
import { useToast } from '@/hooks/use-toast';

const JoinRequestNotifications: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<JoinRequest | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPendingRequests();
      subscribeToJoinRequests();
    }
  }, [user]);

  const fetchPendingRequests = async () => {
    if (!user) return;

    try {
      const requests = await api.getPendingJoinRequestsForOwner(user.id);
      setPendingRequests(requests);
      
      // Show the first pending request if any
      if (requests.length > 0 && !isPopupOpen) {
        setCurrentRequest(requests[0]);
        setIsPopupOpen(true);
      }
    } catch (error) {
      console.error('Error fetching join requests:', error);
    }
  };

  const subscribeToJoinRequests = () => {
    if (!user) return;

    const channel = supabase
      .channel('join-requests-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'join_requests',
          filter: `owner_id=eq.${user.id}`
        },
        async (payload) => {
          // Fetch the complete join request with user and project data
          try {
            const { data: requesterData } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('user_id', payload.new.requester_id)
              .single();

            const { data: projectData } = await supabase
              .from('projects')
              .select('id, title')
              .eq('id', payload.new.project_id)
              .single();

            if (requesterData && projectData) {
              const newRequest: JoinRequest = {
                id: payload.new.id,
                project_id: payload.new.project_id,
                requester_id: payload.new.requester_id,
                owner_id: payload.new.owner_id,
                created_at: payload.new.created_at,
                status: payload.new.status as "pending" | "accepted" | "rejected",
                requester: requesterData,
                project: projectData
              };

              setPendingRequests(prev => [...prev, newRequest]);
              
              // Show popup for new request if none is currently open
              if (!isPopupOpen) {
                setCurrentRequest(newRequest);
                setIsPopupOpen(true);
              }

              // Show toast notification
              toast({
                title: "New join request",
                description: `${requesterData.full_name} wants to join your project`,
              });
            }
          } catch (error) {
            console.error('Error fetching new join request:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAcceptRequest = async (requestId: string) => {
    setIsLoading(true);
    try {
      await api.updateJoinRequestStatus(requestId, 'accepted');
      
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({
        title: "Request accepted",
        description: "The join request has been accepted",
      });
      
      handleClosePopup();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept the request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setIsLoading(true);
    try {
      await api.updateJoinRequestStatus(requestId, 'rejected');
      
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({
        title: "Request declined",
        description: "The join request has been declined",
      });
      
      handleClosePopup();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to decline the request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setCurrentRequest(null);
    
    // Show next pending request if any
    setTimeout(() => {
      const nextRequest = pendingRequests.find(req => req.id !== currentRequest?.id);
      if (nextRequest) {
        setCurrentRequest(nextRequest);
        setIsPopupOpen(true);
      }
    }, 500);
  };

  return (
    <JoinRequestPopup
      isOpen={isPopupOpen}
      onClose={handleClosePopup}
      joinRequest={currentRequest}
      onAccept={handleAcceptRequest}
      onReject={handleRejectRequest}
      isLoading={isLoading}
    />
  );
};

export default JoinRequestNotifications;