'use client';

import { useState, useEffect } from 'react';
import {
  useUpdateProjectStatusOrder,
  useDeleteProject,
} from '@/hooks/useProjects';
import { ProjectCard } from '@/components/ProjectCard';
import { EditProjectDialog } from '@/components/EditProjectDialog';
import { DeleteProjectDialog } from '@/components/DeleteProjectDialog';
import { Project } from '@/types';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

const columns = [
  { id: 'new', title: 'New' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'completed', title: 'Completed' },
] as const;

interface DroppableColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}

const DroppableColumn = ({
  id,
  title,
  count,
  children,
}: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col transition-colors ${
        isOver ? 'ring-primary/50 rounded-lg ring-2' : ''
      }`}
    >
      <div
        className={`bg-muted mb-4 flex items-center justify-between rounded-lg px-4 py-3 transition-colors ${
          isOver ? 'bg-primary/10' : ''
        }`}
      >
        <h2 className="text-foreground font-semibold">{title}</h2>
        <span className="bg-background text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
          {count}
        </span>
      </div>
      <div
        className={`flex flex-1 flex-col rounded-lg p-2 transition-colors ${
          isOver ? 'bg-muted/30' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
};

interface ProjectsBoardProps {
  projects: Project[];
}

export function ProjectsBoard({ projects }: ProjectsBoardProps) {
  const updateProjectStatusOrder = useUpdateProjectStatusOrder();
  const deleteProjectMutation = useDeleteProject();

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { isCollapsed } = useSidebar();

  // Fix hydration error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const project = projects.find((p) => p.id === event.active.id);
    if (project) {
      setActiveProject(project);
    }
  };

  const getProjectsByStatus = (status: Project['status']) => {
    return projects
      .filter((p) => p.status === status)
      .sort((a, b) => a.order - b.order);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveProject(null);

    const { active, over } = event;

    if (!over) return;

    const projectId = active.id as number;
    const activeProject = projects.find((p) => p.id === projectId);
    if (!activeProject) return;

    const columnIds = columns.map((c) => c.id) as readonly string[];
    let newStatus: Project['status'];
    let newOrder: number;

    // Dropped on a column header
    if (columnIds.includes(over.id as string)) {
      newStatus = over.id as Project['status'];

      if (activeProject.status !== newStatus) {
        const targetColumnProjects = getProjectsByStatus(newStatus);
        newOrder = targetColumnProjects.length;

        // Tanstack Query mutation with optimistic update
        updateProjectStatusOrder.mutate({
          id: projectId,
          status: newStatus,
          order: newOrder,
          oldStatus: activeProject.status,
        });
      }
    }
    // Dropped on another project card
    else {
      const targetProject = projects.find((p) => p.id === over.id);
      if (!targetProject) return;
      newStatus = targetProject.status;

      const targetColumnProjects = getProjectsByStatus(newStatus);
      const targetIndex = targetColumnProjects.findIndex(
        (p) => p.id === over.id
      );

      // Moving to different column or reordering within same column
      if (activeProject.status !== newStatus || active.id !== over.id) {
        newOrder = targetIndex;

        updateProjectStatusOrder.mutate({
          id: projectId,
          status: newStatus,
          order: newOrder,
          oldStatus: activeProject.status,
        });
      }
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditDialogOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingProject) return;

    // Tanstack Query mutation with optimistic update
    deleteProjectMutation.mutate(deletingProject.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setDeletingProject(null);
      },
    });
  };

  const handleSaveProject = () => {
    // The EditProjectDialog handles the mutation internally
    setEditDialogOpen(false);
    setEditingProject(null);
  };

  // Render simple layout before hydration
  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => {
          const columnProjects = getProjectsByStatus(column.id);
          return (
            <div key={column.id} className="flex flex-col">
              <div className="bg-muted mb-4 flex items-center justify-between rounded-lg px-4 py-3">
                <h2 className="text-foreground font-semibold">
                  {column.title}
                </h2>
                <span className="bg-background text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
                  {columnProjects.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 rounded-lg p-2">
                {columnProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group border-border bg-card cursor-pointer rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-card-foreground font-semibold">
                        {project.name}
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-3 text-sm">
                      {project.description || 'No description'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className={cn(
            'grid gap-6 transition-all duration-300',
            'grid-cols-1 md:grid-cols-2',
            isCollapsed
              ? 'lg:grid-cols-4 xl:grid-cols-5'
              : 'lg:grid-cols-3 xl:grid-cols-4'
          )}
        >
          {columns.map((column) => {
            const columnProjects = getProjectsByStatus(column.id);
            return (
              <DroppableColumn
                key={column.id}
                id={column.id}
                title={column.title}
                count={columnProjects.length}
              >
                <SortableContext items={columnProjects.map((p) => p.id)}>
                  <div className="flex flex-1 flex-col gap-3">
                    {columnProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => handleEditProject(project)}
                        onDelete={() => handleDeleteProject(project)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DroppableColumn>
            );
          })}
        </div>
        <DragOverlay>
          {activeProject ? (
            <ProjectCard project={activeProject} onDelete={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <EditProjectDialog
        project={editingProject}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveProject}
      />

      <DeleteProjectDialog
        project={deletingProject}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      {/* Loading indicator to mutations */}
      {(updateProjectStatusOrder.isPending ||
        deleteProjectMutation.isPending) && (
        <div className="bg-primary text-primary-foreground fixed right-4 bottom-4 rounded-lg px-4 py-2 shadow-lg">
          {updateProjectStatusOrder.isPending ? 'Moving...' : 'Deleting...'}
        </div>
      )}
    </>
  );
}
