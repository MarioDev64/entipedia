'use client';

import { File as FileType } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, FileText, Image, File } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FileItemProps {
  file: FileType;
  onDelete: (id: number) => void;
  onDownload: (id: number) => void;
}

const getFileIcon = (type: string) => {
  if (type.includes('image')) {
    return <Image className="h-8 w-8 text-blue-500" />;
  }
  if (type.includes('pdf')) {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  if (type.includes('word') || type.includes('document')) {
    return <FileText className="h-8 w-8 text-blue-600" />;
  }
  if (type.includes('sheet') || type.includes('excel')) {
    return <FileText className="h-8 w-8 text-green-600" />;
  }
  return <File className="text-muted-foreground h-8 w-8" />;
};

const getFileTypeName = (type: string) => {
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('word') || type.includes('document')) return 'Word';
  if (type.includes('sheet') || type.includes('excel')) return 'Excel';
  if (type.includes('image')) return 'Image';
  return 'File';
};

export const FileItem = ({ file, onDelete, onDownload }: FileItemProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="group p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="bg-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
          {getFileIcon(file.fileType)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-card-foreground truncate font-semibold">
            {file.name}
          </h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
            {file.description || 'No description'}
          </p>
          <div className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
            <span>{getFileTypeName(file.fileType)}</span>
            <span>•</span>
            <span>{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
        <div
          className={cn(
            'flex gap-2 transition-opacity',
            isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDownload(file.id)}
            className="h-8 w-8 p-0"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(file.id)}
            className="text-destructive hover:text-destructive h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
