
// Common interface types for our API services

export interface User {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  full_name?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthSession {
  user: User | null;
  token?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  category?: string;
  tags?: string[];
  main_image?: string;
  media_urls?: string[];
  owner?: {
    name: string;
    avatar: string;
  };
  likes?: number;
  comments?: number;
  created_at?: string;
  updated_at?: string;
}

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
  likes?: number;
  isLiked?: boolean;
  replies_count?: number;
}

export interface JoinRequest {
  id: string;
  project_id: string;
  requester_id: string;
  owner_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  requester?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  project?: {
    id: string;
    title: string;
  };
}

export interface ChatMessage {
  id: string;
  project_id?: string;
  sender_id: string;
  recipient_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  created_at: string;
  sender?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'join_request' | 'comment' | 'like' | 'message' | 'project_update';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_id?: string;
  action_url?: string;
}

export interface ChatParticipant {
  id: string;
  project_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
  user?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface FileUploadResult {
  path: string;
  url: string;
}

// Base interface for our service providers
export interface ApiProvider {
  // Auth methods
  signUp(email: string, password: string, userData?: Partial<User>): Promise<AuthSession>;
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  resetPassword(email: string): Promise<void>;

  // User profile methods
  getProfile(userId: string): Promise<User | null>;
  updateProfile(profile: Partial<User>): Promise<User>;

  // Project methods
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  createProject(project: Partial<Project>): Promise<Project>;
  updateProject(id: string, data: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Comments methods
  getCommentsByProjectId(projectId: string): Promise<Comment[]>;
  addComment(projectId: string, userId: string, content: string): Promise<Comment | null>;
  
  // Join requests methods
  createJoinRequest(projectId: string, requesterId: string, ownerId: string): Promise<JoinRequest | null>;
  getPendingJoinRequestsForOwner(ownerId: string): Promise<JoinRequest[]>;
  updateJoinRequestStatus(requestId: string, status: "accepted" | "rejected"): Promise<JoinRequest | null>;
  checkExistingJoinRequest(projectId: string, userId: string): Promise<boolean>;
  
  // Chat methods
  getProjectChatMessages(projectId: string): Promise<ChatMessage[]>;
  sendProjectChatMessage(projectId: string, content: string): Promise<ChatMessage>;
  getProjectChatParticipants(projectId: string): Promise<ChatParticipant[]>;
  addProjectChatParticipant(projectId: string, userId: string): Promise<void>;
  
  // Private messaging methods
  getPrivateMessages(userId: string): Promise<ChatMessage[]>;
  sendPrivateMessage(recipientId: string, content: string): Promise<ChatMessage>;
  
  // Notification methods
  getNotifications(): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;
  createNotification(notification: Partial<Notification>): Promise<Notification>;
  
  // Like/Save methods
  toggleLike(projectId: string): Promise<boolean>;
  toggleSave(projectId: string): Promise<boolean>;
  isProjectLiked(projectId: string): Promise<boolean>;
  isProjectSaved(projectId: string): Promise<boolean>;
  getProjectLikeCount(projectId: string): Promise<number>;
  getUserLikeAndSaveStatus(projectId: string, userId: string): Promise<{ isLiked: boolean; isSaved: boolean }>;
  
  // User-specific project methods
  getUserProjects(userId: string): Promise<Project[]>;
  getUserProjectCount(userId: string): Promise<number>;
  getSavedProjects(userId: string): Promise<Project[]>;
  
  // Storage methods
  uploadFile(bucket: string, file: File, path?: string): Promise<FileUploadResult>;
  getFileUrl(bucket: string, path: string): string;
  deleteFile(bucket: string, path: string): Promise<void>;
}
