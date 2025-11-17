import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time that data is considered fresh (no automatic refetch)
      staleTime: 1000 * 30, // 30 secs

      // Time that data remains in cache without being used
      gcTime: 1000 * 60 * 5, // 5 minutos (antes era cacheTime)

      // No automatic refetch on window focus (can be changed as needed)
      refetchOnWindowFocus: false,

      // Refetch automatically on reconnect (useful for mobile)
      refetchOnReconnect: true,

      // Retries on error
      retry: 1,

      // Retry function with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retries for mutations (create, update, delete)
      retry: 1,
    },
  },
});
