'use client';

import { useState, Suspense } from 'react';
import { useFiles, useDeleteFile, useDownloadFile } from '@/hooks/useFiles';
import { UploadFileDialog } from '@/components/UploadFileDialog';
import { DeleteFileDialog } from '@/components/DeleteFileDialog';
import { FileItem } from '@/components/FileItem';
import { File } from '@/types';
import { FilesSkeleton } from '@/components/skeletons/FilesSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function FilesContent() {
  const { data: files, isLoading, error, refetch } = useFiles();
  const deleteFileMutation = useDeleteFile();
  const downloadFile = useDownloadFile();

  const [deletingFile, setDeletingFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { isCollapsed } = useSidebar();

  const handleDelete = (file: File) => {
    setDeletingFile(file);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingFile) return;

    deleteFileMutation.mutate(deletingFile.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setDeletingFile(null);
      },
    });
  };

  const handleDownload = (fileId: number) => {
    downloadFile.mutate(fileId);
  };

  if (isLoading) {
    return <FilesSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="bg-destructive/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <AlertCircle className="text-destructive h-8 w-8" />
        </div>
        <h2 className="text-foreground mb-2 text-2xl font-bold">
          Failed to load files
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">{error.message}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const filesList = files || [];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mt-2 text-foreground text-3xl font-bold">Files</h1>
          <p className="text-muted-foreground mt-1">
            Store and manage all your files
          </p>
        </div>
        <UploadFileDialog />
      </div>

      {filesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-lg">No files uploaded yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Upload your first file to get started
          </p>
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-4 transition-all duration-300',
            'grid-cols-1 sm:grid-cols-2',
            isCollapsed
              ? 'lg:grid-cols-4 xl:grid-cols-5'
              : 'lg:grid-cols-3 xl:grid-cols-4'
          )}
        >
          {filesList.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onDelete={() => handleDelete(file)}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      <DeleteFileDialog
        file={deletingFile}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      {(deleteFileMutation.isPending || downloadFile.isPending) && (
        <div className="bg-primary text-primary-foreground fixed right-4 bottom-4 rounded-lg px-4 py-2 shadow-lg">
          {deleteFileMutation.isPending ? 'Deleting...' : 'Downloading...'}
        </div>
      )}
    </>
  );
}

export default function FilesPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FilesSkeleton />}>
        <FilesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
