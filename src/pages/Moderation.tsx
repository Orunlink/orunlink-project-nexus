
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ShieldCheck, ShieldX, Flag, Trash2, UserX, Users, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for moderation
const mockReports = [
  { id: "r1", type: "post", contentId: "p123", reporter: "user123", reason: "Inappropriate content", status: "pending", timestamp: "2025-05-01T14:30:00Z" },
  { id: "r2", type: "comment", contentId: "c456", reporter: "user456", reason: "Harassment", status: "pending", timestamp: "2025-05-02T09:15:00Z" },
  { id: "r3", type: "profile", contentId: "u789", reporter: "user789", reason: "Fake account", status: "resolved", timestamp: "2025-05-02T11:45:00Z" },
  { id: "r4", type: "project", contentId: "pr234", reporter: "user234", reason: "Copyright infringement", status: "pending", timestamp: "2025-05-03T08:20:00Z" },
];

const mockUsers = [
  { id: "user123", username: "john_doe", email: "john@example.com", status: "active", joinDate: "2025-01-15T00:00:00Z" },
  { id: "user456", username: "jane_smith", email: "jane@example.com", status: "active", joinDate: "2025-02-10T00:00:00Z" },
  { id: "user789", username: "robert_johnson", email: "robert@example.com", status: "suspended", joinDate: "2025-03-05T00:00:00Z" },
  { id: "user234", username: "sarah_williams", email: "sarah@example.com", status: "active", joinDate: "2025-04-20T00:00:00Z" },
];

const mockContent = [
  { id: "p123", type: "post", author: "user456", title: "My first post", reportCount: 3, createdAt: "2025-04-28T14:30:00Z" },
  { id: "c456", type: "comment", author: "user123", content: "This is a comment", reportCount: 1, createdAt: "2025-05-01T09:15:00Z" },
  { id: "pr234", type: "project", author: "user234", title: "New Project Idea", reportCount: 2, createdAt: "2025-04-15T08:20:00Z" },
];

// Access code for the moderation page - move to environment variables in production
const ACCESS_CODE = import.meta.env.VITE_MODERATION_ACCESS_CODE || "orunlink25";

const Moderation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authorized, setAuthorized] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [reports, setReports] = useState(mockReports);
  const [users, setUsers] = useState(mockUsers);
  const [content, setContent] = useState(mockContent);

  // Check if user is already authorized (could use localStorage in a real app)
  useEffect(() => {
    const storedAuth = localStorage.getItem("moderationAuthorized");
    if (storedAuth === "true") {
      setAuthorized(true);
    }
  }, []);

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === ACCESS_CODE) {
      setAuthorized(true);
      localStorage.setItem("moderationAuthorized", "true");
      toast({
        title: "Access Granted",
        description: "Welcome to the Orunlink Moderation Panel",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid access code",
        variant: "destructive",
      });
    }
  };

  const handleResolveReport = (reportId: string) => {
    setReports(
      reports.map((report) =>
        report.id === reportId ? { ...report, status: "resolved" } : report
      )
    );
    toast({
      title: "Report Resolved",
      description: `Report #${reportId} has been marked as resolved`,
    });
  };

  const handleDismissReport = (reportId: string) => {
    setReports(
      reports.map((report) =>
        report.id === reportId ? { ...report, status: "dismissed" } : report
      )
    );
    toast({
      title: "Report Dismissed",
      description: `Report #${reportId} has been dismissed`,
    });
  };

  const handleBanUser = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: "banned" } : user
      )
    );
    toast({
      title: "User Banned",
      description: `User with ID ${userId} has been banned`,
      variant: "destructive",
    });
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: "suspended" } : user
      )
    );
    toast({
      title: "User Suspended",
      description: `User with ID ${userId} has been suspended`,
    });
  };

  const handleContentRemoval = (contentId: string) => {
    setContent(content.filter((item) => item.id !== contentId));
    toast({
      title: "Content Removed",
      description: `Content with ID ${contentId} has been removed`,
    });
  };

  if (!authorized) {
    return (
      <Layout hideHeader={true} hideBottomNav={true}>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center">
                <Shield className="mr-2 text-orunlink-purple" />
                Orunlink Moderation
              </CardTitle>
              <CardDescription className="text-center">Enter the access code to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccessSubmit}>
                <div className="space-y-4">
                  <Input
                    id="accessCode"
                    placeholder="Access Code"
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                  />
                  <Button type="submit" className="w-full">Verify Access</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideBottomNav={true}>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Shield className="mr-2 text-orunlink-purple h-8 w-8" />
            <h1 className="text-2xl font-bold">Orunlink Moderation Panel</h1>
          </div>
          <Button variant="outline" onClick={() => {
            localStorage.removeItem("moderationAuthorized");
            setAuthorized(false);
            setAccessCode("");
          }}>
            Logout
          </Button>
        </div>

        <div className="stats flex flex-wrap gap-4 mb-8">
          <Card className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">
                {reports.filter(r => r.status === "pending").length} pending
              </p>
            </CardContent>
          </Card>
          <Card className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter(u => u.status !== "active").length} restricted
              </p>
            </CardContent>
          </Card>
          <Card className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{content.length}</div>
              <p className="text-xs text-muted-foreground">
                {content.reduce((sum, item) => sum + item.reportCount, 0)} total flags
              </p>
            </CardContent>
          </Card>
          <Card className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="reports" className="flex items-center">
              <Flag className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center">
              <Trash2 className="w-4 h-4 mr-2" />
              Flagged Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Reports</CardTitle>
                <CardDescription>
                  Review and take action on reported content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.id}</TableCell>
                        <TableCell className="capitalize">{report.type}</TableCell>
                        <TableCell>{report.reason}</TableCell>
                        <TableCell>{report.reporter}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              report.status === "resolved" ? "outline" : 
                              report.status === "dismissed" ? "secondary" : 
                              "destructive"
                            }
                          >
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {report.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex items-center" 
                                onClick={() => handleResolveReport(report.id)}
                              >
                                <ShieldCheck className="w-4 h-4 mr-1" />
                                Resolve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex items-center" 
                                onClick={() => handleDismissReport(report.id)}
                              >
                                <ShieldX className="w-4 h-4 mr-1" />
                                Dismiss
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and take moderation actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.status === "active" ? "outline" : 
                              user.status === "suspended" ? "secondary" : 
                              "destructive"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {user.status !== "banned" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex items-center" 
                                onClick={() => handleBanUser(user.id)}
                              >
                                <Ban className="w-4 h-4 mr-1" />
                                Ban
                              </Button>
                            )}
                            {user.status !== "suspended" && user.status !== "banned" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex items-center" 
                                onClick={() => handleSuspendUser(user.id)}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Suspend
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Content</CardTitle>
                <CardDescription>
                  Review and manage content that has been flagged by users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Report Count</TableHead>
                      <TableHead>Creation Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {content.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell className="capitalize">{item.type}</TableCell>
                        <TableCell>{item.author}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {item.title || item.content || "N/A"}
                        </TableCell>
                        <TableCell>{item.reportCount}</TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="flex items-center"
                            onClick={() => handleContentRemoval(item.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Moderation;
