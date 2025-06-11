import { QueryClient } from '@tanstack/react-query';
import { toast } from '../components/ui/use-toast';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      onError: (error: any) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      },
    },
  },
});

export default queryClient;
