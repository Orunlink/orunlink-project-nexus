
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    comments: true,
    likes: true,
    newFollowers: true,
    messages: true,
    projectUpdates: false,
    emailNotifications: true,
    pushNotifications: true
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    toast({
      title: "Settings updated",
      description: "Your notification settings have been updated.",
    });
  };

  return (
    <Layout hideNavbar={true} hideFooter={true}>
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Notification Settings</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-4">
          <h2 className="font-semibold mb-4">Notify me about</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm">Comments on my posts</label>
              <Switch 
                checked={settings.comments} 
                onCheckedChange={() => handleToggle('comments')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm">Likes on my posts</label>
              <Switch 
                checked={settings.likes} 
                onCheckedChange={() => handleToggle('likes')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm">New followers</label>
              <Switch 
                checked={settings.newFollowers} 
                onCheckedChange={() => handleToggle('newFollowers')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm">Direct messages</label>
              <Switch 
                checked={settings.messages} 
                onCheckedChange={() => handleToggle('messages')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm">Project updates</label>
              <Switch 
                checked={settings.projectUpdates} 
                onCheckedChange={() => handleToggle('projectUpdates')}
              />
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <h2 className="font-semibold mb-4">Notification methods</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm">Email notifications</label>
              <Switch 
                checked={settings.emailNotifications} 
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm">Push notifications</label>
              <Switch 
                checked={settings.pushNotifications} 
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationSettings;
