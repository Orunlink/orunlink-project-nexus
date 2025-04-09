
// Re-export from our API layer for backwards compatibility
import { api, Comment, JoinRequest } from './api';

// Methods for Comments
export const getCommentsByProjectId = (projectId: string) => {
  return api.getCommentsByProjectId(projectId);
};

export const addComment = (projectId: string, userId: string, content: string) => {
  return api.addComment(projectId, userId, content);
};

// Methods for Join Requests
export const createJoinRequest = (projectId: string, requesterId: string, ownerId: string) => {
  return api.createJoinRequest(projectId, requesterId, ownerId);
};

export const getPendingJoinRequestsForOwner = (ownerId: string) => {
  return api.getPendingJoinRequestsForOwner(ownerId);
};

export const updateJoinRequestStatus = (requestId: string, status: "accepted" | "rejected") => {
  return api.updateJoinRequestStatus(requestId, status);
};

export const checkExistingJoinRequest = (projectId: string, userId: string) => {
  return api.checkExistingJoinRequest(projectId, userId);
};

// Share project
export const shareProject = async (url: string, platform: string): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: "Check out this project on Orunlink",
        text: "I found this interesting project on Orunlink",
        url
      });
      return true;
    } else {
      // Fallback for browsers that don't support the Web Share API
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch (error) {
    console.error("Error sharing project:", error);
    return false;
  }
};

// Re-export types for backwards compatibility
export type { Comment, JoinRequest };
