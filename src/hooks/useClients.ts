import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listClients,
  createClient,
  updateClient,
  deleteClient,
} from '@/lib/actions/clients';
import { Client } from '@/types';
import { toast } from 'sonner';

// Query Keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters?: any) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientKeys.details(), id] as const,
};

/**
 * Hooks to fetch all clients
 */
export function useClients() {
  return useQuery({
    queryKey: clientKeys.lists(),
    queryFn: async () => {
      const result = await listClients();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch clients');
      }
      return result.data as Client[];
    },
    staleTime: 1000 * 30, // 30 secs
    gcTime: 1000 * 60 * 5, // 5 mins
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createClient(formData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create client');
      }
      return result.data as Client;
    },

    onMutate: async (formData) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.lists() });
      const previousClients = queryClient.getQueryData<Client[]>(
        clientKeys.lists()
      );

      // Optimistic client
      const optimisticClient: Client = {
        id: Date.now(),
        name: formData.get('name') as string,
        type: formData.get('type') as 'person' | 'company',
        valueDop: formData.get('valueDop') as string,
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        createdAt: new Date(),
      };

      queryClient.setQueryData<Client[]>(clientKeys.lists(), (old = []) => [
        optimisticClient,
        ...old,
      ]);

      return { previousClients, optimisticClient };
    },

    onError: (error, variables, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(clientKeys.lists(), context.previousClients);
      }
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success('Client created successfully!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

/**
 * Hook to update a client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Client> }) => {
      const result = await updateClient(id, {
        name: data.name,
        type: data.type,
        valueDop: data.valueDop,
        startDate: data.startDate,
        endDate: data.endDate,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update client');
      }
      return result.data as Client;
    },

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.lists() });
      const previousClients = queryClient.getQueryData<Client[]>(
        clientKeys.lists()
      );

      queryClient.setQueryData<Client[]>(clientKeys.lists(), (old = []) =>
        old.map((client) =>
          client.id === id ? { ...client, ...data } : client
        )
      );

      return { previousClients };
    },

    onError: (error, variables, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(clientKeys.lists(), context.previousClients);
      }
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success('Client updated successfully!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

/**
 * Hook to delete a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteClient(id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete client');
      }
      return id;
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: clientKeys.lists() });
      const previousClients = queryClient.getQueryData<Client[]>(
        clientKeys.lists()
      );

      queryClient.setQueryData<Client[]>(clientKeys.lists(), (old = []) =>
        old.filter((client) => client.id !== id)
      );

      return { previousClients };
    },

    onError: (error, variables, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(clientKeys.lists(), context.previousClients);
      }
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success('Client deleted successfully!');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

/**
 * Hook to prefetch clients
 */
export function usePrefetchClients() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: clientKeys.lists(),
      queryFn: async () => {
        const result = await listClients();
        if (!result.success) throw new Error(result.error);
        return result.data as Client[];
      },
      staleTime: 1000 * 30,
    });
  };
}
