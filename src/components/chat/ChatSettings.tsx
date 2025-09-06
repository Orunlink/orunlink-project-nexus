import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui/avatar";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Upload,
  UserPlus, 
  Shield, 
  UserMinus, 
  Trash2,
  Settings
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { ChatParticipant, GroupChatSettings } from "@/services/api/types";
import { supabase } from "@/integrations/supabase/client";

interface ChatSettingsProps {
  projectId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

const themeColors = [
  { id: "#6366f1", name: "Indigo", color: "bg-indigo-500" },
  { id: "#8b5cf6", name: "Purple", color: "bg-purple-500" },
  { id: "#06b6d4", name: "Cyan", color: "bg-cyan-500" },
  { id: "#10b981", name: "Emerald", color: "bg-emerald-500" },
  { id: "#f59e0b", name: "Amber", color: "bg-amber-500" },
  { id: "#ef4444", name: "Red", color: "bg-red-500" },
];

const backgroundStyles = [
  { id: "default", name: "Default", preview: "bg-background" },
  { id: "gradient", name: "Gradient", preview: "bg-gradient-to-br from-primary/10 to-secondary/10" },
  { id: "pattern", name: "Pattern", preview: "bg-background bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,.15)_1px,transparent_0)] bg-[length:20px_20px]" },
];

const ChatSettings = ({ projectId, onClose, onUpdate }: ChatSettingsProps) => {
  const [activeTab, setActiveTab] = useState("general");
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [settings, setSettings] = useState<GroupChatSettings | null>(null);
  const [userRole, setUserRole] = useState<'creator' | 'admin' | 'member' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadChatData();
    setupRealtimeSubscription();
  }, [projectId, user]);

  const loadChatData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [participantsData, settingsData, role] = await Promise.all([
        api.getProjectChatParticipants(projectId),
        api.getGroupChatSettings(projectId),
        api.getUserChatRole(projectId, user.id)
      ]);
      
      setParticipants(participantsData);
      setSettings(settingsData);
      setUserRole(role);
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast({
        title: "Error",
        description: "Failed to load chat settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('chat-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_chat_settings',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          loadChatData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_participants',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          loadChatData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const canModifySettings = userRole === 'creator' || userRole === 'admin';

  const handleSaveSettings = async () => {
    if (!settings || !canModifySettings) return;
    
    try {
      setIsSaving(true);
      await api.updateGroupChatSettings(projectId, settings);
      toast({
        title: "Settings saved",
        description: "Chat settings have been updated successfully",
      });
      onUpdate?.();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !canModifySettings) return;
    
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const result = await api.uploadFile('project-media', file);
      
      setSettings(prev => prev ? {
        ...prev,
        avatar_url: result.url
      } : null);
      
      toast({
        title: "Avatar updated",
        description: "Group chat avatar has been updated",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRoleChange = async (participantId: string, newRole: 'admin' | 'member') => {
    if (!canModifySettings) return;
    
    try {
      // This would require updating the chat_participants table
      // For now, we'll show a toast indicating the feature is coming soon
      toast({
        title: "Coming soon",
        description: "Role management will be available in the next update",
      });
    } catch (error) {
      console.error('Error changing role:', error);
      toast({
        title: "Error",
        description: "Failed to change user role",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!canModifySettings) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Chat Settings
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Only creators and admins can access chat settings.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Chat Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="appearance">Theme</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Chat Title</Label>
              <Input 
                id="title"
                value={settings?.title || ""}
                onChange={(e) => setSettings(prev => prev ? {...prev, title: e.target.value} : null)}
                placeholder="Enter chat title" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={settings?.description || ""}
                onChange={(e) => setSettings(prev => prev ? {...prev, description: e.target.value} : null)}
                placeholder="Describe this group chat"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Chat Avatar</Label>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={settings?.avatar_url} />
                  <AvatarFallback>
                    {settings?.title?.[0] || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" disabled={isUploadingAvatar}>
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
                    </Button>
                    <input 
                      id="avatar-upload"
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="notifications"
                checked={settings?.notifications_enabled || false}
                onCheckedChange={(checked) => setSettings(prev => prev ? {...prev, notifications_enabled: checked} : null)}
              />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="mt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Members ({participants.length})</h3>
              {participants.map((participant) => (
                <Card key={participant.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={participant.user?.avatar_url} />
                        <AvatarFallback>
                          {participant.user?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {participant.user?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {participant.role}
                        </p>
                      </div>
                    </div>
                    
                    {participant.role !== 'creator' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {participant.role === 'member' && (
                            <DropdownMenuItem onClick={() => handleRoleChange(participant.id, 'admin')}>
                              <Shield className="mr-2 h-4 w-4" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {participant.role === 'admin' && (
                            <DropdownMenuItem onClick={() => handleRoleChange(participant.id, 'member')}>
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="mt-4 space-y-4">
            <div className="space-y-3">
              <Label>Theme Color</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeColors.map(color => (
                  <button
                    key={color.id}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      settings?.theme_color === color.id ? 'border-primary' : 'border-border'
                    }`}
                    onClick={() => setSettings(prev => prev ? {...prev, theme_color: color.id} : null)}
                  >
                    <div className={`w-full h-8 rounded ${color.color} mb-2`}></div>
                    <p className="text-xs">{color.name}</p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Background Style</Label>
              <div className="grid grid-cols-1 gap-2">
                {backgroundStyles.map(style => (
                  <button
                    key={style.id}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-[1.02] ${
                      settings?.background_style === style.id ? 'border-primary' : 'border-border'
                    }`}
                    onClick={() => setSettings(prev => prev ? {...prev, background_style: style.id} : null)}
                  >
                    <div className={`w-full h-8 rounded ${style.preview} mb-2`}></div>
                    <p className="text-sm">{style.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatSettings;