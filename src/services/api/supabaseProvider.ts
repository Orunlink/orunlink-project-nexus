
import { supabase } from "@/integrations/supabase/client";
import { ApiProvider, AuthSession, User, Project, Comment, JoinRequest, ChatMessage, FileUploadResult } from "./types";

export class SupabaseProvider implements ApiProvider {
  // Auth methods
  async signUp(email: string, password: string, userData?: Partial<User>): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      }
    });
    
    if (error) throw error;
    
    return {
      user: data.user,
      token: data.session?.access_token
    };
  }
  
  async signIn(email: string, password: string): Promise<AuthSession> {
    console.log("Attempting to sign in with:", { email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Supabase auth error:", error);
      throw error;
    }
    
    console.log("Sign in successful:", data);
    return {
      user: data.user,
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
    
    return {
      user: data.session.user,
      token: data.session.access_token
    };
  }
  
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  // User profile methods
  // Note: No profiles table in current schema, so we'll use auth.users data
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) return null;
    
    // Convert auth user to our User type
    return {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at
    } as User;
  }
  
  async updateProfile(profile: Partial<User>): Promise<User> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    // Update the auth user metadata since we don't have a profiles table
    const { data, error } = await supabase.auth.updateUser({
      data: profile
    });
    
    if (error) throw error;
    
    // Convert auth user to our User type
    return {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at,
      // Include any other fields from profile that were updated
      ...profile
    } as User;
  }
  
  // Project methods - mock implementation since we don't have projects table
  async getProjects(): Promise<Project[]> {
    // Mock implementation
    return [];
  }
  
  async getProjectById(id: string): Promise<Project | null> {
    // Mock implementation
    return null;
  }
  
  async createProject(project: Partial<Project>): Promise<Project> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    // Mock implementation
    return {
      id: Math.random().toString(36).substring(2),
      title: project.title || "New Project",
      description: project.description || "",
      owner_id: session.user.id,
      created_at: new Date().toISOString()
    } as Project;
  }
  
  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    // Mock implementation
    return {
      id,
      title: data.title || "Updated Project",
      description: data.description || "",
      owner_id: "mock-user-id",
      ...data,
      created_at: new Date().toISOString()
    } as Project;
  }
  
  async deleteProject(id: string): Promise<void> {
    // Mock implementation - nothing to delete
  }

  // Comments methods
  async getCommentsByProjectId(projectId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as Comment[];
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
    return data as unknown as Comment;
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
    return data as unknown as JoinRequest;
  }

  async getPendingJoinRequestsForOwner(ownerId: string): Promise<JoinRequest[]> {
    const { data, error } = await supabase
      .from("join_requests")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("status", "pending");

    if (error) throw error;
    return data as unknown as JoinRequest[];
  }

  async updateJoinRequestStatus(requestId: string, status: "accepted" | "rejected"): Promise<JoinRequest | null> {
    const { data, error } = await supabase
      .from("join_requests")
      .update({ status })
      .eq("id", requestId)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as JoinRequest;
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
  
  // Chat methods - mock implementations
  async getChatMessages(projectId: string): Promise<ChatMessage[]> {
    // Mock implementation
    return [];
  }
  
  async sendChatMessage(projectId: string, content: string, attachments?: string[]): Promise<ChatMessage> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    // Mock implementation
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
    const filePath = path || `${Math.random().toString(36).substring(2)}-${file.name}`;
    
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
