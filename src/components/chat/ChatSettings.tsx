
import { useState } from "react";
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
  CardHeader, 
  CardContent 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  MoreHorizontal, 
  Image as ImageIcon, 
  UserPlus, 
  Shield, 
  UserMinus, 
  Trash2 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
  role?: "admin" | "member";
}

interface ProjectChatData {
  id: string;
  title: string;
  isGroup: boolean;
  description?: string;
  avatar?: string;
  members: Member[];
  messages: any[];
  wallpaper?: string;
}

interface ChatSettingsProps {
  projectChat: ProjectChatData;
  onClose: () => void;
  onUpdate: (updatedChat: ProjectChatData) => void;
}

const wallpaperOptions = [
  { id: "default", name: "Default (Dark)" },
  { id: "orunlink-gradient", name: "OrUnlink Gradient" },
  { id: "orunlink-pattern", name: "OrUnlink Pattern" }
];

const ChatSettings = ({ projectChat, onClose, onUpdate }: ChatSettingsProps) => {
  const [activeTab, setActiveTab] = useState("general");
  const [updatedChat, setUpdatedChat] = useState<ProjectChatData>({...projectChat});
  const [isProcessing, setIsProcessing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const { toast } = useToast();

  const handleWallpaperChange = (wallpaperId: string) => {
    setUpdatedChat({
      ...updatedChat,
      wallpaper: wallpaperId
    });
  };

  const handleSaveChanges = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onUpdate(updatedChat);
      setIsProcessing(false);
    }, 800);
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${inviteEmail}`,
      });
      setInviteEmail("");
      setIsProcessing(false);
    }, 800);
  };

  const handleMakeAdmin = (memberId: string) => {
    setUpdatedChat({
      ...updatedChat,
      members: updatedChat.members.map(member => 
        member.id === memberId 
          ? { ...member, role: "admin" } 
          : member
      )
    });
    
    toast({
      title: "Admin added",
      description: "The user is now an admin of this project",
    });
  };

  const handleRemoveMember = (memberId: string) => {
    setUpdatedChat({
      ...updatedChat,
      members: updatedChat.members.filter(member => member.id !== memberId)
    });
    
    toast({
      title: "Member removed",
      description: "The user has been removed from this project",
    });
  };

  const getWallpaperPreviewStyle = (wallpaperId: string) => {
    switch (wallpaperId) {
      case 'orunlink-gradient':
        return { backgroundImage: 'linear-gradient(to bottom right, #7C3AED, #9F7AEA)' };
      case 'orunlink-pattern':
        return { 
          backgroundColor: '#121212',
          backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(124, 58, 237, 0.15) 2%, transparent 0%), radial-gradient(circle at 25px 25px, rgba(124, 58, 237, 0.15) 2%, transparent 0%)',
          backgroundSize: '35px 35px' 
        };
      default:
        return { backgroundColor: '#121212' }; // Default black background
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Chat Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Title</label>
              <Input 
                value={updatedChat.title}
                onChange={(e) => setUpdatedChat({...updatedChat, title: e.target.value})}
                placeholder="Project title" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input 
                value={updatedChat.description || ""}
                onChange={(e) => setUpdatedChat({...updatedChat, description: e.target.value})}
                placeholder="Project description" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Avatar</label>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={updatedChat.avatar} />
                  <AvatarFallback>{updatedChat.title[0]}</AvatarFallback>
                </Avatar>
                <Button>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="mt-4 space-y-4">
            <form onSubmit={handleInviteUser} className="flex items-center space-x-2 mb-4">
              <Input 
                placeholder="Email address" 
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button type="submit" disabled={isProcessing}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </form>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Members ({updatedChat.members.length})</h3>
              {updatedChat.members.map((member) => (
                <Card key={member.id} className="mb-2">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">
                          {member.role === "admin" ? "Admin" : "Member"}
                          {member.online && " • Online"}
                        </p>
                      </div>
                    </div>
                    
                    <ContextMenu>
                      <ContextMenuTrigger>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        {member.role !== "admin" && (
                          <ContextMenuItem onClick={() => handleMakeAdmin(member.id)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Make Admin
                          </ContextMenuItem>
                        )}
                        <ContextMenuItem onClick={() => handleRemoveMember(member.id)}>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove from Project
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chat Wallpaper</label>
              <div className="grid grid-cols-3 gap-2">
                {wallpaperOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`cursor-pointer h-20 rounded-md overflow-hidden border-2 ${
                      updatedChat.wallpaper === option.id ? 'border-orunlink-purple' : 'border-gray-200'
                    }`}
                    onClick={() => handleWallpaperChange(option.id)}
                  >
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={getWallpaperPreviewStyle(option.id)}
                    >
                      <span className="text-xs text-white px-1 py-0.5 bg-black/30 rounded">
                        {option.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Danger Zone</label>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Action not available",
                    description: "This is a demo feature",
                    variant: "destructive",
                  });
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project Chat
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveChanges} disabled={isProcessing}>
            {isProcessing ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatSettings;
