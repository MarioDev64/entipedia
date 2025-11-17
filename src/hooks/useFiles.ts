import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listFiles,
  uploadFile,
  deleteFile,
  getFileDownloadUrl,
} from '@/lib/actions/files';
import { File } from '@/types';
import { toast } from 'sonner';

// Query Keys
export const fileKeys = {
  all: ['files'] as const,
  lists: () => [...fileKeys.all, 'list'] as const,
  list: (filters?: any) => [...fileKeys.lists(), filters] as const,
  details: () => [...fileKeys.all, 'detail'] as const,
  detail: (id: number) => [...fileKeys.details(), id] as const,
};

/**
 * Hook to fetch all files
 */
export function useFiles() {
  return useQuery({
    queryKey: fileKeys.lists(),
    queryFn: async () => {
      const result = await listFiles();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch files');
      }
      return result.data as File[];
    },
    staleTime: 1000 * 30, // 30 secs
    gcTime: 1000 * 60 * 5, // 5 mins
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to upload a file
 */
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await uploadFile(formData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload file');
      }
      return result.data as File;
    },

    onMutate: async (formData) => {
      await queryClient.cancelQueries({ queryKey: fileKeys.lists() });
      const previousFiles = queryClient.getQueryData<File[]>(fileKeys.lists());

      // Optimistic file (without real fileUrl until server responds)
      const file = formData.get('file') as globalThis.File;
      const optimisticFile: File = {
        id: Date.now(),
        name: (formData.get('name') as string) || file.name,
        description: (formData.get('description') as string) || null,
        fileType: file.type,
        fileUrl: '', // Will be updated with real response
        createdAt: new Date(),
        size: file.size,
      };

      queryClient.setQueryData<File[]>(fileKeys.lists(), (old = []) => [
        optimisticFile,
        ...old,
      ]);

      return { previousFiles, optimisticFile };
    },

    onError: (error, variables, context) => {
      if (context?.previousFiles) {
        queryClient.setQueryData(fileKeys.lists(), context.previousFiles);
      }
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success('File uploaded successfully!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}

/**
 * Hook to delete a file
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteFile(id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete file');
      }
      return id; // Retorna el ID en lugar de result.data
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: fileKeys.lists() });
      const previousFiles = queryClient.getQueryData<File[]>(fileKeys.lists());

      queryClient.setQueryData<File[]>(fileKeys.lists(), (old = []) =>
        old.filter((file) => file.id !== id)
      );

      return { previousFiles };
    },

    onError: (error, variables, context) => {
      if (context?.previousFiles) {
        queryClient.setQueryData(fileKeys.lists(), context.previousFiles);
      }
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success('File deleted successfully!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() });
    },
  });
}

/**
 * Hook to download a file
 */
export function useDownloadFile() {
  return useMutation({
    mutationFn: async (id: number) => {
      const result = await getFileDownloadUrl(id);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get download URL');
      }

      return result.data;
    },

    onSuccess: (data) => {
      // Create temporary link and click to download
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.filename || 'download';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started');
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook for prefetching files
 */
export function usePrefetchFiles() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: fileKeys.lists(),
      queryFn: async () => {
        const result = await listFiles();
        if (!result.success) throw new Error(result.error);
        return result.data as File[];
      },
      staleTime: 1000 * 30,
    });
  };
}
