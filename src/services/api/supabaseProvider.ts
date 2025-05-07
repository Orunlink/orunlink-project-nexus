
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
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) return null;
    return data as unknown as User;
  }
  
  async updateProfile(profile: Partial<User>): Promise<User> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', session.user.id)
      .select()
      .single();
      
    if (error) throw error;
    return data as unknown as User;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as unknown as Project[];
  }
  
  async getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) return null;
    return data as unknown as Project;
  }
  
  async createProject(project: Partial<Project>): Promise<Project> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const newProject = {
      ...project,
      owner_id: session.user.id
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert(newProject)
      .select()
      .single();
      
    if (error) throw error;
    return data as unknown as Project;
  }
  
  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .update(data)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return project as unknown as Project;
  }
  
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
      
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
    return data as Comment[];
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
    return data as Comment;
  }

  // Join requests methods
  async createJoinRequest(projectId: string, requesterId: string, ownerId: string): Promise<JoinRequest | null> {
    // Check if a request already exists
    const { data: existingRequests } = await supabase
      .from("join_requests")
      .select("*")
      .eq("project_id", projectId)
      .eq("requester_id", requesterId)
      .eq("owner_id", ownerId)
      .eq("status", "pending");

    if (existingRequests && existingRequests.length > 0) {
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

    if (error) throw error;

    // Cast the status to the expected type since we know it's "pending" by default
    return data as JoinRequest;
  }

  async getPendingJoinRequestsForOwner(ownerId: string): Promise<JoinRequest[]> {
    const { data, error } = await supabase
      .from("join_requests")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("status", "pending");

    if (error) throw error;

    return data as JoinRequest[];
  }

  async updateJoinRequestStatus(requestId: string, status: "accepted" | "rejected"): Promise<JoinRequest | null> {
    const { data, error } = await supabase
      .from("join_requests")
      .update({ status })
      .eq("id", requestId)
      .select()
      .single();

    if (error) throw error;

    return data as JoinRequest;
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
  
  // Chat methods
  async getChatMessages(projectId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data as unknown as ChatMessage[];
  }
  
  async sendChatMessage(projectId: string, content: string, attachments?: string[]): Promise<ChatMessage> {
    const session = await this.getSession();
    if (!session?.user?.id) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        project_id: projectId,
        user_id: session.user.id,
        content,
        attachments
      })
      .select()
      .single();
      
    if (error) throw error;
    return data as unknown as ChatMessage;
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
