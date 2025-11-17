'use client';

import { useState, useRef } from 'react';
import { useUploadFile } from '@/hooks/useFiles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileIcon, X } from 'lucide-react';
import {
  fileUploadSchema,
  MAX_FILE_SIZE,
  ACCEPTED_FILE_TYPES,
} from '@/lib/validations/file';
import { z } from 'zod';
import { toast } from 'sonner';

export const UploadFileDialog = () => {
  const uploadFile = useUploadFile();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(
    null
  );
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: globalThis.File) => {
    setSelectedFile(file);
    setName(file.name.split('.')[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      const validatedData = fileUploadSchema.parse({
        name,
        description,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });

      setErrors({});

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', validatedData.name);
      formData.append('description', validatedData.description || '');

      uploadFile.mutate(formData, {
        onSuccess: () => {
          setOpen(false);
          // Reset form
          setSelectedFile(null);
          setName('');
          setDescription('');
          setErrors({});
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Please fix the validation errors');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Upload a new file to your workspace. Max size: 10MB.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>File</Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-muted/30 hover:bg-muted/50'
              } ${errors.fileType || errors.fileSize ? 'border-destructive' : ''}`}
            >
              {selectedFile ? (
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileIcon className="text-primary h-10 w-10" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="text-muted-foreground mb-4 h-12 w-12" />
                  <p className="text-muted-foreground mb-2 text-sm">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-muted-foreground text-xs">
                    PDF, DOC, XLS, PNG, JPG, WEBP (max 10MB)
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    className="mt-4"
                    accept={ACCEPTED_FILE_TYPES.join(',')}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    disabled={uploadFile.isPending}
                  />
                </>
              )}
            </div>
            {errors.fileType && (
              <p className="text-destructive text-sm">{errors.fileType}</p>
            )}
            {errors.fileSize && (
              <p className="text-destructive text-sm">{errors.fileSize}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-name">Name</Label>
            <Input
              id="file-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter file name"
              disabled={uploadFile.isPending}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-description">Description (optional)</Label>
            <Textarea
              id="file-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter file description"
              rows={3}
              disabled={uploadFile.isPending}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedFile(null);
                setName('');
                setDescription('');
                setErrors({});
              }}
              disabled={uploadFile.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!selectedFile || uploadFile.isPending}
            >
              {uploadFile.isPending ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
