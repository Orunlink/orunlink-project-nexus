
import { supabase } from "@/integrations/supabase/client";

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: {
    name: string;
    avatar: string;
  };
}

export interface JoinRequest {
  id: string;
  project_id: string;
  requester_id: string;
  owner_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

// Comments
export const getCommentsByProjectId = async (projectId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data || [];
};

export const addComment = async (projectId: string, userId: string, content: string): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      project_id: projectId,
      user_id: userId,
      content
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    return null;
  }

  return data;
};

// Join Requests
export const createJoinRequest = async (projectId: string, requesterId: string, ownerId: string): Promise<JoinRequest | null> => {
  // Check if a request already exists
  const { data: existingRequests } = await supabase
    .from("join_requests")
    .select("*")
    .eq("project_id", projectId)
    .eq("requester_id", requesterId)
    .eq("status", "pending");

  if (existingRequests && existingRequests.length > 0) {
    console.log("Request already exists");
    return existingRequests[0] as JoinRequest;
  }

  const { data, error } = await supabase
    .from("join_requests")
    .insert({
      project_id: projectId,
      requester_id: requesterId,
      owner_id: ownerId
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating join request:", error);
    return null;
  }

  // Cast the status to the expected type since we know it's "pending" by default
  return {
    ...data,
    status: data.status as "pending" | "accepted" | "rejected"
  };
};

export const getPendingJoinRequestsForOwner = async (ownerId: string): Promise<JoinRequest[]> => {
  const { data, error } = await supabase
    .from("join_requests")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("status", "pending");

  if (error) {
    console.error("Error fetching join requests:", error);
    return [];
  }

  // Cast the status for each item in the array
  return data?.map(item => ({
    ...item,
    status: item.status as "pending" | "accepted" | "rejected"
  })) || [];
};

export const updateJoinRequestStatus = async (requestId: string, status: "accepted" | "rejected"): Promise<JoinRequest | null> => {
  const { data, error } = await supabase
    .from("join_requests")
    .update({ status })
    .eq("id", requestId)
    .select()
    .single();

  if (error) {
    console.error("Error updating join request:", error);
    return null;
  }

  // Cast the status to the expected type
  return {
    ...data,
    status: data.status as "pending" | "accepted" | "rejected"
  };
};

// Check if user has already requested to join
export const checkExistingJoinRequest = async (projectId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("join_requests")
    .select("*")
    .eq("project_id", projectId)
    .eq("requester_id", userId)
    .eq("status", "pending");

  if (error) {
    console.error("Error checking join request:", error);
    return false;
  }

  return data && data.length > 0;
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
