import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listProjects,
  createProject,
  updateProject,
  updateProjectStatusAndOrder,
  deleteProject,
} from '@/lib/actions/projects';
import { Project } from '@/types';
import { toast } from 'sonner';

// Query Keys - Centralized for easy maintenance
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: any) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
};

/**
 * Hook to obtain all projects
 * With automatic prefetching and cache optimizations
 */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: async () => {
      const result = await listProjects();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch projects');
      }
      return result.data as Project[];
    },
    // Data considered fresh for 20 seconds
    staleTime: 1000 * 20,
    // Mantain in cache for 5 minutes
    gcTime: 1000 * 60 * 5,
    // Refetch in background when window regains focus
    refetchOnWindowFocus: true,
    // Show a placeholder while loading (avoids empty UI)
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to create a new project
 * With optimistic updates and automatic rollback on error
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createProject(formData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create project');
      }
      return result.data as Project;
    },

    // Optimistic Update: Updates UI before server response
    onMutate: async (formData) => {
      // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      // 2. Make a snapshot of the previous state (for rollback if it fails)
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.lists()
      );

      // 3. Obtain the current state and calculate the order
      const currentProjects = previousProjects || [];
      const status = (formData.get('status') as Project['status']) || 'new';
      const projectsInStatus = currentProjects.filter(
        (p) => p.status === status
      );
      const maxOrder =
        projectsInStatus.length > 0
          ? Math.max(...projectsInStatus.map((p) => p.order))
          : -1;

      // 4. Create a temporary optimistic project
      const optimisticProject: Project = {
        id: Date.now(), // ID temporal
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || null,
        status,
        priority: (formData.get('priority') as Project['priority']) || 'medium',
        order: maxOrder + 1,
        createdAt: new Date(),
      };

      // 5. Update the cache optimistically
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old = []) => [
        ...old,
        optimisticProject,
      ]);

      // 6. Return context for rollback
      return { previousProjects, optimisticProject };
    },

    // If mutation fails, roll back to previous state
    onError: (error, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
      toast.error(error.message);
    },

    // In case of success, show toast
    onSuccess: (newProject) => {
      toast.success('Project created successfully!');
    },

    // Always refetch after mutation completes (error or success)
    // This ensures we have the server's real data
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Project>;
    }) => {
      const result = await updateProject(id, {
        name: data.name,
        description: data.description === null ? null : data.description,
        status: data.status,
        priority: data.priority,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update project');
      }
      return result.data as Project;
    },

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.lists()
      );

      // Optimistic update
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old = []) =>
        old.map((project) =>
          project.id === id ? { ...project, ...data } : project
        )
      );

      return { previousProjects };
    },

    onError: (error, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success('Project updated successfully!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to update project status and order (used in drag & drop)
 */
export function useUpdateProjectStatusOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      order,
      oldStatus,
    }: {
      id: number;
      status: Project['status'];
      order: number;
      oldStatus: Project['status'];
    }) => {
      const result = await updateProjectStatusAndOrder(
        id,
        status,
        order,
        oldStatus
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to update project');
      }
      return result.data as Project;
    },

    onMutate: async ({ id, status, order }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.lists()
      );

      // Optimistic update to drag & drop
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old = []) => {
        // Find the project that is moving
        const projectToMove = old.find((p) => p.id === id);
        if (!projectToMove) return old;

        // Create a new array with the updated project
        return old.map((project) =>
          project.id === id ? { ...project, status, order } : project
        );
      });

      return { previousProjects };
    },

    onError: (error, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success('Project moved successfully!');
    },

    onSettled: () => {
      // Refetch para asegurar orden correcto del servidor
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteProject(id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete project');
      }
      return result.data;
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.lists()
      );

      // Optimistic delete
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old = []) =>
        old.filter((project) => project.id !== id)
      );

      return { previousProjects };
    },

    onError: (error, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success('Project deleted successfully!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to prefetch projects
 * Util to hover effects or anticipatory navigation
 */
export function usePrefetchProjects() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: projectKeys.lists(),
      queryFn: async () => {
        const result = await listProjects();
        if (!result.success) throw new Error(result.error);
        return result.data as Project[];
      },
      staleTime: 1000 * 20,
    });
  };
}
