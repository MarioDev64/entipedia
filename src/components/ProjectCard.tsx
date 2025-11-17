'use client';

import { Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  onDelete?: () => void;
}

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const ProjectCard = ({
  project,
  onClick,
  onDelete,
}: ProjectCardProps) => {
  const isMobile = useIsMobile();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group border-border bg-card cursor-pointer rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-card-foreground flex-1 font-semibold">
          {project.name}
        </h3>
        <div className="flex items-center gap-1">
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className={cn(
                'text-muted-foreground hover:text-destructive h-7 w-7 p-0 transition-opacity',
                isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <button
            {...attributes}
            {...listeners}
            className={cn(
              'text-muted-foreground hover:text-foreground cursor-grab p-1 transition-opacity active:cursor-grabbing',
              isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
      <p className="text-muted-foreground mb-3 text-sm">
        {project.description || 'No description'}
      </p>
      <div className="flex items-center justify-between">
        <Badge className={priorityColors[project.priority]} variant="secondary">
          {project.priority}
        </Badge>
        <span className="text-muted-foreground text-xs">
          {format(new Date(project.createdAt), 'MMM d, yyyy')}
        </span>
      </div>
    </div>
  );
};
