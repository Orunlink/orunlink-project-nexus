import { supabase } from "@/integrations/supabase/client";
import { ApiProvider, AuthSession, User, Project, Comment, JoinRequest, ChatMessage, ChatParticipant, Notification, FileUploadResult } from "./types";

export class SupabaseProvider implements ApiProvider {
  // Auth methods
  async signUp(email: string, password: string, userData?: Partial<User>): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          username: userData?.username || email.split('@')[0],
          full_name: userData?.full_name || email.split('@')[0],
          ...userData
        },
      }
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to get the profile that should have been created by the trigger
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      return {
        user: profile ? {
          id: data.user.id,
          email: data.user.email,
          username: profile.username,
          full_name: profile.full_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        } : {
          id: data.user.id,
          email: data.user.email,
          ...userData
        },
        token: data.session?.access_token
      };
    }
    
    return {
      user: null,
      token: data.session?.access_token
    };
  }
  
  async signIn(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Get profile data
    let user: User = {
      id: data.user.id,
      email: data.user.email,
    };

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", data.user.id)
      .single();

    if (profile) {
      user = {
        ...user,
        username: profile.username,
        full_name: profile.full_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      };
    }
    
    return {
      user,
      token: data.session?.access_token
    };
  }
  
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
  
  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    
    // Get profile data
    let user: User = {
      id: data.session.user.id,
      email: data.session.user.email,
    };

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", data.session.user.id)
      .single();

    if (profile) {
      user = {
        ...user,
        username: profile.username,
        full_name: profile.full_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      };
    }
    
    return {
      user,
      token: data.session.access_token
    };
  }
  
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  // User profile methods
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (error) return null;
    
    return {
      id: data.user_id,
      username: data.username,
      full_name: data.full_name,
      bio: data.bio,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
  
  async updateProfile(profile: Partial<User>): Promise<User> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("profiles")
      .update({
        username: profile.username,
        full_name: profile.full_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      })
      .eq("user_id", session.user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.user_id,
      username: data.username,
      full_name: data.full_name,
      bio: data.bio,
      avatar_url: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
  
  // Project methods
  async getProjects(options?: { limit?: number; offset?: number }): Promise<Project[]> {
    const limit = options?.limit ?? 8;
    const offset = options?.offset ?? 0;

    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_media(media_url, media_type, display_order)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!data) return [];

    const projectIds = data.map((p) => p.id);
    const ownerIds = Array.from(new Set(data.map((p) => p.owner_id)));

    const [likesData, commentsData, profilesRes] = await Promise.all([
      supabase.from("likes").select("project_id").in("project_id", projectIds),
      supabase.from("comments").select("project_id").in("project_id", projectIds),
      supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", ownerIds),
    ]);

    const likeCounts =
      likesData.data?.reduce((acc, like) => {
        acc[like.project_id] = (acc[like.project_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    const commentCounts =
      commentsData.data?.reduce((acc, comment) => {
        acc[comment.project_id] = (acc[comment.project_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

    const profileMap = new Map<string, any>();
    profilesRes.data?.forEach((p: any) => profileMap.set(p.user_id, p));

    const projectsWithOwners = data.map((project) => {
      const profile = profileMap.get(project.owner_id);
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        owner_id: project.owner_id,
        category: project.category,
        tags: project.tags,
        main_image: project.main_image,
        media_urls: project.project_media?.map((m: any) => m.media_url) || [],
        owner: {
          name: profile?.full_name || profile?.username || "Unknown User",
          avatar: profile?.avatar_url || "",
        },
        likes: likeCounts[project.id] || 0,
        comments: commentCounts[project.id] || 0,
        created_at: project.created_at,
        updated_at: project.updated_at,
      };
    });

    return projectsWithOwners;
  }
  
  async getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_media(media_url, media_type, display_order)
      `)
      .eq("id", id)
      .single();

    if (error) return null;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      owner_id: data.owner_id,
      category: data.category,
      tags: data.tags,
      main_image: data.main_image,
      media_urls: data.project_media?.map((m: any) => m.media_url) || [],
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
  
  async createProject(project: Partial<Project>): Promise<Project> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: project.title || "New Project",
        description: project.description,
        owner_id: session.user.id,
        category: project.category,
        tags: project.tags,
        main_image: project.main_image
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      owner_id: data.owner_id,
      category: data.category,
      tags: data.tags,
      main_image: data.main_image,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
  
  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from("projects")
      .update({
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        tags: projectData.tags,
        main_image: projectData.main_image
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      owner_id: data.owner_id,
      category: data.category,
      tags: data.tags,
      main_image: data.main_image,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
  
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }

  // Comments methods
  async getCommentsByProjectId(projectId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Get profile data for each comment
    const commentsWithProfiles = await Promise.all(
      data.map(async (comment) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("user_id", comment.user_id)
          .single();

        return {
          id: comment.id,
          project_id: comment.project_id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          author: {
            name: profile?.full_name || profile?.username || 'Anonymous',
            avatar: profile?.avatar_url || ''
          }
        };
      })
    );
    
    return commentsWithProfiles;
  }

  async addComment(projectId: string, userId: string, content: string): Promise<Comment | null> {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        project_id: projectId,
        user_id: userId,
        content
      })
      .select()
      .single();

    if (error) throw error;
    
    // Get profile data for the comment author
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, full_name, avatar_url")
      .eq("user_id", data.user_id)
      .single();

    // Notify project owner (if not self)
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('owner_id, title')
        .eq('id', projectId)
        .single();
      if (project && project.owner_id !== userId) {
        await this.createNotification({
          user_id: project.owner_id,
          type: 'comment',
          title: 'New comment',
          message: `${profile?.full_name || profile?.username || 'Someone'} commented on ${project.title}`,
          related_id: projectId,
          action_url: `/project/${projectId}`,
        });
      }
    } catch (e) {
      console.warn('Failed to create comment notification', e);
    }
    
    return {
      id: data.id,
      project_id: data.project_id,
      user_id: data.user_id,
      content: data.content,
      created_at: data.created_at,
      author: {
        name: profile?.full_name || profile?.username || 'Anonymous',
        avatar: profile?.avatar_url || ''
      }
    };
  }

  // Join requests methods
async createJoinRequest(projectId: string, requesterId: string, ownerId: string): Promise<JoinRequest | null> {
  const { data, error } = await supabase
    .from("join_requests")
    .insert({
      project_id: projectId,
      requester_id: requesterId,
      owner_id: ownerId,
      status: "pending"
    })
    .select()
    .single();

  if (error) throw error;

  // Best-effort notify the owner
  try {
    await this.createNotification({
      user_id: ownerId,
      type: 'join_request',
      title: 'New join request',
      message: 'Someone requested to join your project',
      related_id: projectId,
      action_url: `/project/${projectId}`,
    });
  } catch (e) {
    console.warn('Failed to create owner notification', e);
  }
  
  return {
    id: data.id,
    project_id: data.project_id,
    requester_id: data.requester_id,
    owner_id: data.owner_id,
    status: data.status as "pending" | "accepted" | "rejected",
    created_at: data.created_at
  };
}

  async getPendingJoinRequestsForOwner(ownerId: string): Promise<JoinRequest[]> {
    const { data, error } = await supabase
      .from("join_requests")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("status", "pending");

    if (error) throw error;
    
    // Get profile and project data for each request
    const requestsWithData = await Promise.all(
      data.map(async (request) => {
        const [{ data: requesterData }, { data: projectData }] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('user_id', request.requester_id)
            .single(),
          supabase
            .from('projects')
            .select('id, title')
            .eq('id', request.project_id)
            .single()
        ]);

        return {
          id: request.id,
          project_id: request.project_id,
          requester_id: request.requester_id,
          owner_id: request.owner_id,
          status: request.status as "pending" | "accepted" | "rejected",
          created_at: request.created_at,
          requester: requesterData,
          project: projectData
        };
      })
    );
    
    return requestsWithData;
  }

async updateJoinRequestStatus(requestId: string, status: "accepted" | "rejected"): Promise<JoinRequest | null> {
  const { data, error } = await supabase
    .from("join_requests")
    .update({ status })
    .eq("id", requestId)
    .select()
    .single();

  if (error) throw error;

  try {
    if (status === "accepted") {
      // Ensure requester is a chat participant
      const { data: existingParticipant } = await supabase
        .from("chat_participants")
        .select("id")
        .eq("project_id", data.project_id)
        .eq("user_id", data.requester_id)
        .maybeSingle();

      if (!existingParticipant) {
        await supabase.from("chat_participants").insert({
          project_id: data.project_id,
          user_id: data.requester_id,
        });
      }

      // Notify requester of acceptance
      try {
        await this.createNotification({
          user_id: data.requester_id,
          type: 'join_request',
          title: 'Request accepted',
          message: 'You can now join the project chat.',
          related_id: data.project_id,
          action_url: `/project/${data.project_id}/chat`,
        });
      } catch (e) {
        // Ignore notification errors
        console.warn('Failed to create acceptance notification', e);
      }
    } else if (status === "rejected") {
      // Notify requester of rejection
      try {
        await this.createNotification({
          user_id: data.requester_id,
          type: 'join_request',
          title: 'Request declined',
          message: 'Your request to join was declined.',
          related_id: data.project_id,
          action_url: `/project/${data.project_id}`,
        });
      } catch (e) {
        console.warn('Failed to create rejection notification', e);
      }
    }
  } catch (postProcessError) {
    console.warn('Post-update processing failed', postProcessError);
  }
  
  return {
    id: data.id,
    project_id: data.project_id,
    requester_id: data.requester_id,
    owner_id: data.owner_id,
    status: data.status as "pending" | "accepted" | "rejected",
    created_at: data.created_at
  };
}

  async checkExistingJoinRequest(projectId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("join_requests")
      .select("*")
      .eq("project_id", projectId)
      .eq("requester_id", userId)
      .eq("status", "pending");

    if (error) throw error;
    return data && data.length > 0;
  }
  
  // Like/Save methods
  async toggleLike(projectId: string): Promise<boolean> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const { data: existing } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("project_id", projectId)
      .single();
    
    if (existing) {
      // Unlike
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("id", existing.id);
      
      if (error) throw error;
      return false;
    } else {
      // Like
      const { error } = await supabase
        .from("likes")
        .insert({
          user_id: session.user.id,
          project_id: projectId
        });
      
      if (error) throw error;
      return true;
    }
  }

  async toggleSave(projectId: string): Promise<boolean> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const { data: existing } = await supabase
      .from("saves")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("project_id", projectId)
      .single();
    
    if (existing) {
      // Unsave
      const { error } = await supabase
        .from("saves")
        .delete()
        .eq("id", existing.id);
      
      if (error) throw error;
      return false;
    } else {
      // Save
      const { error } = await supabase
        .from("saves")
        .insert({
          user_id: session.user.id,
          project_id: projectId
        });
      
      if (error) throw error;
      return true;
    }
  }

  async isProjectLiked(projectId: string): Promise<boolean> {
    const session = await this.getSession();
    if (!session?.user?.id) return false;
    
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("project_id", projectId)
      .single();
    
    return !error && !!data;
  }

  async isProjectSaved(projectId: string): Promise<boolean> {
    const session = await this.getSession();
    if (!session?.user?.id) return false;
    
    const { data, error } = await supabase
      .from("saves")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("project_id", projectId)
      .single();
    
    return !error && !!data;
  }

  async getProjectLikeCount(projectId: string): Promise<number> {
    const { count, error } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);
    
    if (error) throw error;
    return count || 0;
  }

  async getUserLikeAndSaveStatus(projectId: string, userId: string): Promise<{ isLiked: boolean; isSaved: boolean }> {
    try {
      const [likeData, saveData] = await Promise.all([
        supabase
          .from('likes')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('saves')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      return {
        isLiked: !!likeData.data,
        isSaved: !!saveData.data
      };
    } catch (error) {
      console.error('Error getting user like/save status:', error);
      return { isLiked: false, isSaved: false };
    }
  }
  
  // Chat methods
  async getProjectChatMessages(projectId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    
    if (error) throw error;
    
    // Get sender profiles separately
    const messagesWithSenders = await Promise.all(
      (data || []).map(async (msg) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("user_id", msg.sender_id)
          .single();
        
        return {
          ...msg,
          message_type: msg.message_type as 'text' | 'image' | 'file',
          sender: profile ? {
            username: profile.username || '',
            full_name: profile.full_name || '',
            avatar_url: profile.avatar_url || ''
          } : undefined
        };
      })
    );
    
    return messagesWithSenders;
  }
  
  async sendProjectChatMessage(projectId: string, content: string): Promise<ChatMessage> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        project_id: projectId,
        sender_id: session.user.id,
        content,
        message_type: 'text'
      })
      .select("*")
      .single();
    
    if (error) throw error;
    
    // Get sender profile separately
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, full_name, avatar_url")
      .eq("user_id", data.sender_id)
      .single();
    
    return {
      ...data,
      message_type: data.message_type as 'text' | 'image' | 'file',
      sender: profile ? {
        username: profile.username || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || ''
      } : undefined
    };
  }
  
  async getProjectChatParticipants(projectId: string): Promise<ChatParticipant[]> {
    const { data, error } = await supabase
      .from("chat_participants")
      .select("*")
      .eq("project_id", projectId);
    
    if (error) throw error;
    
    // Get user profiles separately
    const participantsWithUsers = await Promise.all(
      (data || []).map(async (participant) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("user_id", participant.user_id)
          .single();
        
        return {
          ...participant,
          user: profile ? {
            username: profile.username || '',
            full_name: profile.full_name || '',
            avatar_url: profile.avatar_url || ''
          } : undefined
        };
      })
    );
    
    return participantsWithUsers;
  }
  
  async addProjectChatParticipant(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("chat_participants")
      .insert({
        project_id: projectId,
        user_id: userId
      });
    
    if (error) throw error;
  }
  
  async getPrivateMessages(userId: string): Promise<ChatMessage[]> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`and(sender_id.eq.${session.user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${session.user.id})`)
      .is("project_id", null)
      .order("created_at", { ascending: true });
    
    if (error) throw error;
    
    // Get sender profiles separately
    const messagesWithSenders = await Promise.all(
      (data || []).map(async (msg) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("user_id", msg.sender_id)
          .single();
        
        return {
          ...msg,
          message_type: msg.message_type as 'text' | 'image' | 'file',
          sender: profile ? {
            username: profile.username || '',
            full_name: profile.full_name || '',
            avatar_url: profile.avatar_url || ''
          } : undefined
        };
      })
    );
    
    return messagesWithSenders;
  }
  
  async sendPrivateMessage(recipientId: string, content: string): Promise<ChatMessage> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        sender_id: session.user.id,
        recipient_id: recipientId,
        content,
        message_type: 'text'
      })
      .select("*")
      .single();
    
    if (error) throw error;
    
    // Get sender profile separately
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, full_name, avatar_url")
      .eq("user_id", data.sender_id)
      .single();
    
    return {
      ...data,
      message_type: data.message_type as 'text' | 'image' | 'file',
      sender: profile ? {
        username: profile.username || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || ''
      } : undefined
    };
  }
  
  // Notification methods
  async getNotifications(): Promise<Notification[]> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data?.map(notification => ({
      ...notification,
      type: notification.type as 'join_request' | 'comment' | 'like' | 'message' | 'project_update'
    })) || [];
  }
  
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
    
    if (error) throw error;
  }
  
  async markAllNotificationsAsRead(): Promise<void> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id);
    
    if (error) throw error;
  }
  
  async createNotification(notification: Partial<Notification>): Promise<Notification> {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title || '',
        message: notification.message || '',
        is_read: notification.is_read || false,
        related_id: notification.related_id,
        action_url: notification.action_url
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      type: data.type as 'join_request' | 'comment' | 'like' | 'message' | 'project_update'
    };
  }
  
  // Storage methods
  async uploadFile(bucket: string, file: File, path?: string): Promise<FileUploadResult> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const filePath = path || `${session.user.id}/${Math.random().toString(36).substring(2)}-${file.name}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    
    return {
      path: filePath,
      url: data.publicUrl
    };
  }
  
  getFileUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
  
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
      
    if (error) throw error;
  }

  // User-specific project methods
  async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_media(media_url, media_type, display_order)
      `)
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data) return [];

    // Get project IDs for batch operations
    const projectIds = data.map(p => p.id);
    
    // Get likes and comments count for all projects
    const [likesData, commentsData] = await Promise.all([
      supabase
        .from("likes")
        .select("project_id")
        .in("project_id", projectIds),
      supabase
        .from("comments")
        .select("project_id")
        .in("project_id", projectIds)
    ]);

    // Count likes and comments per project
    const likeCounts = likesData.data?.reduce((acc, like) => {
      acc[like.project_id] = (acc[like.project_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const commentCounts = commentsData.data?.reduce((acc, comment) => {
      acc[comment.project_id] = (acc[comment.project_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get profiles for each project separately  
    const projectsWithOwners = await Promise.all(
      data.map(async (project) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("user_id", project.owner_id)
          .single();

        return {
          id: project.id,
          title: project.title,
          description: project.description,
          owner_id: project.owner_id,
          category: project.category,
          tags: project.tags,
          main_image: project.main_image,
          media_urls: project.project_media?.map((media: any) => media.media_url) || [],
          owner: {
            name: profile?.full_name || profile?.username || "Unknown User",
            avatar: profile?.avatar_url || ""
          },
          created_at: project.created_at,
          updated_at: project.updated_at,
          likes: likeCounts[project.id] || 0,
          comments: commentCounts[project.id] || 0
        };
      })
    );

    return projectsWithOwners;
  }

  async getUserProjectCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", userId);

    if (error) throw error;
    return count || 0;
  }

  async getSavedProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from("saves")
      .select(`
        project_id,
        projects(
          *,
          project_media(media_url, media_type, display_order)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!data) return [];

    // Get project IDs for batch operations
    const projectIds = data.map(s => s.projects.id);
    
    // Get likes and comments count for all projects
    const [likesData, commentsData] = await Promise.all([
      supabase
        .from("likes")
        .select("project_id")
        .in("project_id", projectIds),
      supabase
        .from("comments")
        .select("project_id")
        .in("project_id", projectIds)
    ]);

    // Count likes and comments per project
    const likeCounts = likesData.data?.reduce((acc, like) => {
      acc[like.project_id] = (acc[like.project_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const commentCounts = commentsData.data?.reduce((acc, comment) => {
      acc[comment.project_id] = (acc[comment.project_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get owner profiles for each project separately
    const savedProjectsWithOwners = await Promise.all(
      data.map(async (save) => {
        const project = save.projects;
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("user_id", project.owner_id)
          .single();

        return {
          id: project.id,
          title: project.title,
          description: project.description,
          owner_id: project.owner_id,
          category: project.category,
          tags: project.tags,
          main_image: project.main_image,
          media_urls: project.project_media?.map((media: any) => media.media_url) || [],
          owner: {
            name: profile?.full_name || profile?.username || "Unknown User",
            avatar: profile?.avatar_url || ""
          },
          created_at: project.created_at,
          updated_at: project.updated_at,
          likes: likeCounts[project.id] || 0,
          comments: commentCounts[project.id] || 0
        };
      })
    );

    return savedProjectsWithOwners;
  }
}

// Export singleton instance
export const supabaseProvider = new SupabaseProvider();