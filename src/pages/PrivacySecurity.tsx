
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    privateAccount: false,
    showActivity: true,
    twoFactorAuth: false,
    locationData: true
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    toast({
      title: "Settings updated",
      description: "Your privacy settings have been updated.",
    });
  };

  return (
    <Layout hideNavbar={true}>
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
          <h1 className="text-lg font-semibold">Privacy & Security</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-4">
          <h2 className="font-semibold mb-4">Privacy</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm">Private account</label>
              <Switch 
                checked={settings.privateAccount} 
                onCheckedChange={() => handleToggle('privateAccount')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm">Show activity status</label>
              <Switch 
                checked={settings.showActivity} 
                onCheckedChange={() => handleToggle('showActivity')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm">Share location data</label>
              <Switch 
                checked={settings.locationData} 
                onCheckedChange={() => handleToggle('locationData')}
              />
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <h2 className="font-semibold mb-4">Security</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm">Two-factor authentication</label>
              <Switch 
                checked={settings.twoFactorAuth} 
                onCheckedChange={() => handleToggle('twoFactorAuth')}
              />
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => {
                toast({
                  title: "Action initiated",
                  description: "Password change request has been sent to your email.",
                });
              }}
            >
              Change password
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Sessions cleared",
                  description: "You have been logged out from all other devices.",
                });
              }}
            >
              Log out of all devices
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacySecurity;
