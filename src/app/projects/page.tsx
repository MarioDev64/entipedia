"use client";

import { Suspense } from "react";
import { useProjects } from "@/hooks/useProjects";
import { ProjectsBoard } from "@/components/ProjectsBoard";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { ProjectsSkeleton } from "@/components/skeletons/ProjectsSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function ProjectsContent() {
  const { data: projects, isLoading, error, refetch } = useProjects();

  if (isLoading) {
    return <ProjectsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Failed to load projects
        </h2>
        <p className="mb-6 max-w-md text-muted-foreground">
          {error.message}
        </p>
        <Button onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Projects</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track all your projects
          </p>
        </div>
        <NewProjectDialog />
      </div>

      <ProjectsBoard projects={projects || []} />
    </>
  );
}

export default function ProjectsPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </ErrorBoundary>
  );
}