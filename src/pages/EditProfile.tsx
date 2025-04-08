
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock user data
  const mockUser = {
    id: "user1",
    name: "Alex Johnson",
    username: "alexj",
    bio: "UI/UX Designer specializing in mobile interfaces and web applications",
    email: "alex@example.com"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    navigate(-1);
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
          <h1 className="text-lg font-semibold">Edit Profile</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-orunlink-purple"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input defaultValue={mockUser.name} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input defaultValue={mockUser.username} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" defaultValue={mockUser.email} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea 
                defaultValue={mockUser.bio}
                rows={4}
                className="resize-none"
              />
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;
