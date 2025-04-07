
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { JoinRequest, updateJoinRequestStatus } from "@/services/projectService";
import { useToast } from "@/hooks/use-toast";

interface JoinRequestNotificationProps {
  request: JoinRequest;
  onStatusUpdate: (requestId: string, status: "accepted" | "rejected") => void;
}

const JoinRequestNotification = ({ 
  request, 
  onStatusUpdate 
}: JoinRequestNotificationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateStatus = async (status: "accepted" | "rejected") => {
    setIsLoading(true);
    try {
      const result = await updateJoinRequestStatus(request.id, status);
      if (result) {
        onStatusUpdate(request.id, status);
        toast({
          title: status === "accepted" ? "Request accepted" : "Request declined",
          description: status === "accepted" 
            ? "The user has been added to your project" 
            : "The user has been notified that their request was declined",
        });
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      toast({
        title: "Error",
        description: "Failed to update request status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            {/* Here we would use the requester's actual avatar if available */}
          </Avatar>
          <div>
            <p className="font-medium">Join Request</p>
            <p className="text-sm text-gray-500">
              A user wants to join your project "{request.project_id}"
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          disabled={isLoading} 
          onClick={() => handleUpdateStatus("rejected")}
        >
          <X className="h-4 w-4 mr-1" />
          Decline
        </Button>
        <Button 
          className="bg-orunlink-purple hover:bg-orunlink-dark"
          size="sm"
          disabled={isLoading}
          onClick={() => handleUpdateStatus("accepted")}
        >
          <Check className="h-4 w-4 mr-1" />
          Accept
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JoinRequestNotification;
