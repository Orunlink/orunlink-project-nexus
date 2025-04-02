
import { useState } from "react";
import { Bell, Check, Clock, User, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

// Sample notification data
const initialNotifications = [
  {
    id: 1,
    title: "New Project Invitation",
    description: "Alice invited you to collaborate on 'UX Design Project'",
    time: "2 hours ago",
    read: false,
    type: "invitation",
    user: {
      name: "Alice Johnson",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: 2,
    title: "Comment on your project",
    description: "Bob commented on your 'Mobile App Design' project",
    time: "Yesterday",
    read: false,
    type: "comment",
    user: {
      name: "Bob Smith",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: 3,
    title: "Project update",
    description: "The 'Website Redesign' project has been updated",
    time: "3 days ago",
    read: true,
    type: "update",
    user: {
      name: "System",
      avatar: "/placeholder.svg"
    }
  },
  {
    id: 4,
    title: "Trending project",
    description: "Your 'Logo Design' project is trending",
    time: "1 week ago",
    read: true,
    type: "trending",
    user: {
      name: "System",
      avatar: "/placeholder.svg"
    }
  }
];

// Function to get the appropriate notification badge color
const getNotificationBadge = (type: string) => {
  switch (type) {
    case "invitation":
      return <Badge className="bg-orunlink-purple">Invitation</Badge>;
    case "comment":
      return <Badge className="bg-blue-500">Comment</Badge>;
    case "update":
      return <Badge className="bg-amber-500">Update</Badge>;
    case "trending":
      return <Badge className="bg-green-500">Trending</Badge>;
    default:
      return <Badge>Notification</Badge>;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filterType, setFilterType] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter notifications based on selected type
  const filteredNotifications = filterType 
    ? notifications.filter(notification => notification.type === filterType) 
    : notifications;

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    toast({
      title: "All notifications marked as read",
      description: "Your notification feed has been cleared",
    });
  };

  // Delete a notification
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    toast({
      title: "Notification removed",
      description: "The notification has been deleted",
    });
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-gray-500">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setFilterType(null)}
              className={!filterType ? "bg-muted" : ""}
            >
              All
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setFilterType("invitation")}
              className={filterType === "invitation" ? "bg-muted" : ""}
            >
              Invitations
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setFilterType("comment")}
              className={filterType === "comment" ? "bg-muted" : ""}
            >
              Comments
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setFilterType("update")}
              className={filterType === "update" ? "bg-muted" : ""}
            >
              Updates
            </Button>
          </div>
        </div>

        {unreadCount > 0 && (
          <div className="mb-6 flex justify-end">
            <Button onClick={markAllAsRead} variant="ghost" className="text-orunlink-purple">
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-gray-500">
                  {filterType ? "No notifications of this type." : "You're all caught up!"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-l-orunlink-purple' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <User className="h-6 w-6" />
                      </Avatar>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {notification.title}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {notification.time}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getNotificationBadge(notification.type)}
                      {!notification.read && (
                        <Badge variant="outline" className="bg-orunlink-light/10 text-orunlink-purple">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{notification.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  {!notification.read ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark as read
                    </Button>
                  ) : (
                    <span></span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
