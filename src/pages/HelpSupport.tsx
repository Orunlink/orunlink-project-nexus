
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const HelpSupport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      toast({
        title: "Message sent",
        description: "Your support request has been submitted. We'll get back to you soon.",
      });
      setMessage("");
    }
  };

  return (
    <Layout>
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
          <h1 className="text-lg font-semibold">Help & Support</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-4">
          <h2 className="font-semibold mb-4">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I create a new project?</AccordionTrigger>
              <AccordionContent>
                To create a new project, tap on the + button in the navigation bar and follow the instructions to set up your project details.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I invite collaborators?</AccordionTrigger>
              <AccordionContent>
                Open your project, tap on the settings icon, and select &quot;Members&quot;. From there, you can invite collaborators via email or username.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I change my password?</AccordionTrigger>
              <AccordionContent>
                Go to Account Settings {`>`} Privacy &amp; Security and tap on &quot;Change password&quot;. Follow the instructions to set a new password.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I delete my account?</AccordionTrigger>
              <AccordionContent>
                Yes, you can delete your account from Account Settings {`>`} Privacy &amp; Security {`>`} Account Actions. Please note this action is irreversible.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <h2 className="font-semibold mb-4">Contact Support</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea 
              placeholder="Describe your issue or question..."
              className="h-32 resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-orunlink-purple hover:bg-orunlink-dark"
              disabled={!message.trim()}
            >
              Submit Request
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Need immediate help?</p>
            <Button 
              variant="link" 
              className="text-orunlink-purple"
              onClick={() => {
                toast({
                  title: "Opening documentation",
                  description: "Redirecting you to our documentation website.",
                });
              }}
            >
              Visit our documentation
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpSupport;
