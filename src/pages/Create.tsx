
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Create = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      
      const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Project created!",
        description: "Your project has been published successfully",
      });
      
      navigate('/projects');
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
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden glass-card">
                    <img 
                      src={url} 
                      alt={`Preview ${index}`} 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-1"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                
                <div className="aspect-square rounded-md border-2 border-dashed border-blue-200 flex flex-col items-center justify-center hover:bg-blue-50/30 transition-colors backdrop-blur-sm">
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4"
                  >
                    <Camera className="w-8 h-8 text-orunlink-purple mb-2" />
                    <span className="text-sm text-orunlink-dark">Add Media</span>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
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
