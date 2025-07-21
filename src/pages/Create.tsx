
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import FileUpload from "@/components/ui/FileUpload";

const Create = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your project",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No media selected",
        description: "Please upload at least one image or video",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create a project",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Process tag string into array
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Upload files to storage
      const mediaUrls: string[] = [];
      let mainImage = '';
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await api.uploadFile('project-media', file);
        mediaUrls.push(result.url);
        
        // Use first image as main image
        if (i === 0) {
          mainImage = result.url;
        }
      }
      
      // Create project in database
      const project = await api.createProject({
        title,
        description,
        category,
        tags: tagArray,
        main_image: mainImage,
        media_urls: mediaUrls
      });
      
      toast({
        title: "Project created!",
        description: "Your project has been published successfully",
      });
      
      navigate(`/project/${project.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 blue-gradient-bg min-h-screen">
        <div className="glass-card p-6">
          <h1 className="text-2xl font-bold mb-6 text-orunlink-dark">Create New Project</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/70 border-blue-100/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[120px] bg-white/70 border-blue-100/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Design, Technology, Art"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-white/70 border-blue-100/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="Separate tags with commas"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-white/70 border-blue-100/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload Media</Label>
              <FileUpload 
                onFilesSelected={handleFilesSelected}
                acceptedTypes="image/*,video/*"
                maxFiles={10}
                maxSize={50}
                className="mt-2"
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-orunlink-dark to-orunlink-purple hover:opacity-90 px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Uploading...</span>
                    <span className="animate-spin">
                      <Upload className="w-4 h-4" />
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Publish Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Create;
