
import { ApiProvider, AuthSession, User, Project, Comment, JoinRequest, ChatMessage, ChatParticipant, Notification, FileUploadResult } from "./types";

// Mock data
const mockUsers: Record<string, User> = {
  "demo@orunlink.com": {
    id: "demo-user-id-123",
    email: "demo@orunlink.com",
    username: "demouser",
    full_name: "Demo User",
    bio: "This is a demo account for testing purposes",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
  }
};

const mockSession: AuthSession = {
  user: mockUsers["demo@orunlink.com"],
  token: "mock-token-123"
};

export class MockAuthProvider implements ApiProvider {
  private mockProjects: Project[] = [];
  async signUp(email: string, password: string, userData?: Partial<User>): Promise<AuthSession> {
    console.log("Mock signup called with:", email);
    
    // Create a new mock user
    const newUser: User = {
      id: `user-${Math.random().toString(36).substring(2, 15)}`,
      email,
      ...userData
    };
    
    mockUsers[email] = newUser;
    return { user: newUser, token: "mock-token-" + newUser.id };
  }
  
  async signIn(email: string, password: string): Promise<AuthSession> {
    console.log("Mock sign in with:", email);
    
    // For demo account, always succeed
    if (email === "demo@orunlink.com") {
      return mockSession;
    }
    
    // For any other email, check if it exists in our mock users
    if (mockUsers[email]) {
      return { user: mockUsers[email], token: "mock-token-" + mockUsers[email].id };
    }
    
    // Simulate failed login
    throw new Error("Invalid email or password");
  }
  
  async signOut(): Promise<void> {
    console.log("Mock sign out");
    // Nothing to do here in mock version
  }
  
  async getSession(): Promise<AuthSession | null> {
    // For simplicity, always return the demo user session
    return mockSession;
  }
  
  async resetPassword(email: string): Promise<void> {
    console.log("Mock reset password for:", email);
  }
  
  async getProfile(userId: string): Promise<User | null> {
    // Return the demo user for any ID for simplicity
    return mockUsers["demo@orunlink.com"];
  }
  
  async updateProfile(profile: Partial<User>): Promise<User> {
    console.log("Mock update profile:", profile);
    const user = mockUsers["demo@orunlink.com"];
    
    // Update the mock user
    mockUsers["demo@orunlink.com"] = {
      ...user,
      ...profile
    };
    
    return mockUsers["demo@orunlink.com"];
  }
  
  async createProfile(profile: Partial<User>): Promise<User> {
    console.log("Mock create profile:", profile);
    // Just return the profile as is for mock purposes
    return profile as User;
  }
  
  // Project methods - just return empty mock data
  async getProjects(): Promise<Project[]> { return []; }
  async getProjectById(id: string): Promise<Project | null> { return null; }
  async createProject(project: Partial<Project>): Promise<Project> { 
    return { id: "mock-project-id", title: "Mock Project", owner_id: "demo-user-id-123", ...project };
  }
  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return { id, title: "Mock Project", owner_id: "demo-user-id-123", ...data };
  }
  async deleteProject(id: string): Promise<void> {}
  
  // Comments methods
  async getCommentsByProjectId(projectId: string): Promise<Comment[]> { return []; }
  async addComment(projectId: string, userId: string, content: string): Promise<Comment | null> {
    return { id: "comment-id", project_id: projectId, user_id: userId, content, created_at: new Date().toISOString() };
  }
  
  // Join requests
  async createJoinRequest(projectId: string, requesterId: string, ownerId: string): Promise<JoinRequest | null> {
    return {
      id: "mock-request-id",
      project_id: projectId,
      requester_id: requesterId,
      owner_id: ownerId,
      status: "pending",
      created_at: new Date().toISOString()
    };
  }
  
  async getPendingJoinRequestsForOwner(ownerId: string): Promise<JoinRequest[]> { return []; }
  async updateJoinRequestStatus(requestId: string, status: "accepted" | "rejected"): Promise<JoinRequest | null> {
    return null;
  }
  async checkExistingJoinRequest(projectId: string, userId: string): Promise<boolean> { return false; }
  
  // Chat methods
  async getProjectChatMessages(projectId: string): Promise<ChatMessage[]> { return []; }
  async sendProjectChatMessage(projectId: string, content: string): Promise<ChatMessage> {
    return {
      id: "message-id",
      project_id: projectId,
      sender_id: "demo-user-id-123",
      content,
      message_type: 'text',
      created_at: new Date().toISOString()
    };
  }
  async getProjectChatParticipants(projectId: string): Promise<ChatParticipant[]> { return []; }
  async addProjectChatParticipant(projectId: string, userId: string): Promise<void> {}
  async getPrivateMessages(userId: string): Promise<ChatMessage[]> { return []; }
  async sendPrivateMessage(recipientId: string, content: string): Promise<ChatMessage> {
    return {
      id: "private-message-id",
      sender_id: "demo-user-id-123",
      recipient_id: recipientId,
      content,
      message_type: 'text',
      created_at: new Date().toISOString()
    };
  }
  
  // Notification methods
  async getNotifications(): Promise<Notification[]> { return []; }
  async markNotificationAsRead(notificationId: string): Promise<void> {}
  async markAllNotificationsAsRead(): Promise<void> {}
  async createNotification(notification: Partial<Notification>): Promise<Notification> {
    return {
      id: "notification-id",
      user_id: "demo-user-id-123",
      type: 'comment',
      title: 'Mock Notification',
      message: 'This is a mock notification',
      is_read: false,
      created_at: new Date().toISOString(),
      ...notification
    } as Notification;
  }
  
  // Like/Save methods
  async toggleLike(projectId: string): Promise<boolean> {
    return Math.random() > 0.5;
  }

  async toggleSave(projectId: string): Promise<boolean> {
    return Math.random() > 0.5;
  }

  async isProjectLiked(projectId: string): Promise<boolean> {
    return Math.random() > 0.5;
  }

  async isProjectSaved(projectId: string): Promise<boolean> {
    return Math.random() > 0.5;
  }

  async getProjectLikeCount(projectId: string): Promise<number> {
    return Math.floor(Math.random() * 100);
  }

  async getUserLikeAndSaveStatus(projectId: string, userId: string): Promise<{ isLiked: boolean; isSaved: boolean }> {
    return {
      isLiked: Math.random() > 0.5,
      isSaved: Math.random() > 0.5
    };
  }

  // Storage methods
  async uploadFile(bucket: string, file: File, path?: string): Promise<FileUploadResult> {
    return {
      path: "mock-file-path",
      url: URL.createObjectURL(file)
    };
  }
  
  getFileUrl(bucket: string, path: string): string {
    return `https://placehold.co/600x400?text=Mock+File`;
  }
  
  async deleteFile(bucket: string, path: string): Promise<void> {}

  // User-specific project methods
  async getUserProjects(userId: string): Promise<Project[]> {
    // Return projects filtered by user ID
    return this.mockProjects.filter(p => p.owner_id === userId);
  }

  async getUserProjectCount(userId: string): Promise<number> {
    return this.mockProjects.filter(p => p.owner_id === userId).length;
  }

  async getSavedProjects(userId: string): Promise<Project[]> {
    // Mock implementation - return empty array
    return [];
  }
}

// Export singleton instance
export const mockAuthProvider = new MockAuthProvider();
