import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { villageAPI } from '../services/api';
import { VillageResources, ResourceType } from '../types/game';
import { useVillage } from './useVillage';
import { toast } from '../components/ui/use-toast';
import { useGame } from '../contexts/GameContext';

export const useResources = (villageId: string) => {
  const queryClient = useQueryClient();
  const { isConnected } = useGame();
  
  // Get current resources
  const {
    data: resources,
    isLoading,
    error,
    refetch,
  } = useQuery<VillageResources>({
    queryKey: ['village', villageId, 'resources'],
    queryFn: () => villageAPI.getResources(villageId).then(res => res.data),
    enabled: !!villageId,
    refetchInterval: isConnected ? false : 30000, // Only poll if not using WebSocket
  });

  // Collect resources
  const { mutate: collect, isPending: isCollecting } = useMutation({
    mutationFn: (resourceType: ResourceType) => 
      villageAPI.collectResources(villageId, resourceType),
    onSuccess: (_, resourceType) => {
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
      toast({
        title: 'Resources Collected',
        description: `You've collected ${resourceType} from your village.`,
      });
    },
  });

  // Update resources when WebSocket event is received
  const { subscribe } = useGame();
  
  useEffect(() => {
    if (!isConnected) return;
    
    const unsubscribe = subscribe('village:update', (data: { villageId: string }) => {
      if (data.villageId === villageId) {
        queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
      }
    });
    
    return () => unsubscribe();
  }, [villageId, isConnected, subscribe, queryClient]);

  // Calculate resource production rates per hour
  const calculateProductionRate = (resourceType: ResourceType): number => {
    if (!resources) return 0;
    return resources.production[resourceType] || 0;
  };

  // Calculate storage capacity
  const calculateStorage = (resourceType: ResourceType): { current: number; max: number } => {
    if (!resources) return { current: 0, max: 0 };
    
    return {
      current: resources[resourceType],
      max: resources.storage[resourceType] || 0,
    };
  };

  // Check if player has enough resources
  const hasResources = (costs: Partial<Record<ResourceType, number>>): boolean => {
    if (!resources) return false;
    
    return Object.entries(costs).every(([resource, amount]) => {
      const resourceKey = resource as ResourceType;
      return (resources[resourceKey] || 0) >= (amount || 0);
    });
  };

  // Format resource amount with K/M/B suffixes
  const formatResource = (amount: number, decimals: number = 1): string => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(decimals)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(decimals)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(decimals)}K`;
    }
    return amount.toString();
  };

  // Calculate time until full storage for a resource
  const timeUntilFull = (resourceType: ResourceType): string => {
    if (!resources) return '--:--:--';
    
    const current = resources[resourceType];
    const max = resources.storage[resourceType] || 1;
    const production = resources.production[resourceType] || 0;
    
    if (production <= 0) return '∞';
    
    const remaining = max - current;
    const seconds = Math.ceil(remaining / (production / 3600)); // Convert per hour to per second
    
    if (seconds <= 0) return 'Full';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  return {
    // Data
    resources,
    
    // Loading states
    isLoading,
    isCollecting,
    
    // Errors
    error,
    
    // Actions
    collect,
    refetch,
    
    // Utilities
    calculateProductionRate,
    calculateStorage,
    hasResources,
    formatResource,
    timeUntilFull,
  };
};

// Hook to get a specific resource
export const useResource = (villageId: string, resourceType: ResourceType) => {
  const { resources, ...rest } = useResources(villageId);
  
  return {
    amount: resources?.[resourceType] || 0,
    production: resources?.production[resourceType] || 0,
    storage: resources?.storage[resourceType] || 0,
    ...rest,
  };
};
