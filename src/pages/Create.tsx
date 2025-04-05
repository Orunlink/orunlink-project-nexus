
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";

const Create = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: "Missing title",
        description: "Please provide a title for your project.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedFile) {
      toast({
        title: "No media selected",
        description: "Please upload an image or video for your project.",
        variant: "destructive",
      });
      return;
    }

    // Here you would normally upload the file and create the project
    toast({
      title: "Project created!",
      description: "Your project has been successfully created.",
    });
    
    // Navigate to home after successful upload
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 pt-20">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Project</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="Enter project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Project Media</Label>
            {!previewUrl ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <label className="cursor-pointer flex flex-col items-center space-y-2">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Click to upload image or video
                  </span>
                  <Input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                  />
                </label>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden">
                {selectedFile?.type.startsWith("image/") ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-64 object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full bg-orunlink-purple hover:bg-orunlink-dark">
            Create Project
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Create;
