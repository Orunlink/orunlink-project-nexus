import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Video, File } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
  children?: React.ReactNode;
}

interface PreviewFile extends File {
  preview?: string;
  id: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedTypes = "image/*,video/*",
  maxFiles = 10,
  maxSize = 50,
  className,
  children
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: PreviewFile[] = [];

    fileArray.forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds ${maxSize}MB limit`);
        return;
      }

      // Check if we haven't exceeded max files
      if (selectedFiles.length + validFiles.length >= maxFiles) {
        console.warn(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const fileWithPreview: PreviewFile = Object.assign(file, {
        id: Math.random().toString(36).substring(2),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      });

      validFiles.push(fileWithPreview);
    });

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  }, [selectedFiles, maxFiles, maxSize, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(file => file.id !== fileId);
      // Revoke preview URLs to prevent memory leaks
      prev.forEach(file => {
        if (file.preview && file.id === fileId) {
          URL.revokeObjectURL(file.preview);
        }
      });
      onFilesSelected(updated);
      return updated;
    });
  }, [onFilesSelected]);

  const clearAll = useCallback(() => {
    // Revoke all preview URLs
    selectedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setSelectedFiles([]);
    onFilesSelected([]);
  }, [selectedFiles, onFilesSelected]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        {children || (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {acceptedTypes.includes('image') && acceptedTypes.includes('video') 
                  ? 'Images and videos up to ' 
                  : acceptedTypes.includes('image') 
                    ? 'Images up to ' 
                    : 'Files up to '
                }
                {maxSize}MB each
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        multiple={maxFiles > 1}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Selected files ({selectedFiles.length}/{maxFiles})
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="h-7 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="relative group bg-muted rounded-lg overflow-hidden aspect-square"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
                    {getFileIcon(file)}
                    <span className="text-xs font-medium truncate w-full text-center">
                      {file.name}
                    </span>
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;