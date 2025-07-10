import { supabase } from "@/integrations/supabase/client";
import { ApiProvider, AuthSession, User, Project, Comment, JoinRequest, ChatMessage, FileUploadResult } from "./types";

export class SupabaseProvider implements ApiProvider {
  // Auth methods
  async signUp(email: string, password: string, userData?: Partial<User>): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: userData,
      }
    });
    
    if (error) throw error;
    
    return {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        ...userData
      } : null,
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
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_media(media_url, media_type, display_order)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      owner_id: project.owner_id,
      category: project.category,
      tags: project.tags,
      main_image: project.main_image,
      media_urls: project.project_media?.map((m: any) => m.media_url) || [],
      created_at: project.created_at,
      updated_at: project.updated_at
    }));
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
    
    return data.map(request => ({
      id: request.id,
      project_id: request.project_id,
      requester_id: request.requester_id,
      owner_id: request.owner_id,
      status: request.status as "pending" | "accepted" | "rejected",
      created_at: request.created_at
    }));
  }

  async updateJoinRequestStatus(requestId: string, status: "accepted" | "rejected"): Promise<JoinRequest | null> {
    const { data, error } = await supabase
      .from("join_requests")
      .update({ status })
      .eq("id", requestId)
      .select()
      .single();

    if (error) throw error;
    
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
  
  // Chat methods - mock implementations for now
  async getChatMessages(projectId: string): Promise<ChatMessage[]> {
    return [];
  }
  
  async sendChatMessage(projectId: string, content: string, attachments?: string[]): Promise<ChatMessage> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    return {
      id: Math.random().toString(36).substring(2),
      project_id: projectId,
      user_id: session.user.id,
      content,
      attachments,
      created_at: new Date().toISOString()
    } as ChatMessage;
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
}

// Export singleton instance
export const supabaseProvider = new SupabaseProvider();