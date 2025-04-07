
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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

  return data;
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

  return data || [];
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

  return data;
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
