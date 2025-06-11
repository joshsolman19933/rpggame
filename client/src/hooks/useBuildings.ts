import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { villageAPI } from '../services/api';
import { BuildingInstance, BuildingType, ResourceType } from '../types/game';
import { useVillage } from './useVillage';
import { useResources } from './useResources';
import { useGame } from '../contexts/GameContext';
import { toast } from '../components/ui/use-toast';
import { useCallback, useEffect } from 'react';

export const useBuildings = (villageId: string) => {
  const queryClient = useQueryClient();
  const { isConnected } = useGame();
  const { hasResources } = useResources(villageId);
  
  // Get all buildings in the village
  const {
    data: buildings = [],
    isLoading,
    error,
    refetch,
  } = useQuery<BuildingInstance[]>({
    queryKey: ['village', villageId, 'buildings'],
    queryFn: () => villageAPI.getBuildings(villageId).then(res => res.data),
    enabled: !!villageId,
    refetchInterval: isConnected ? false : 30000, // Only poll if not using WebSocket
  });

  // Get a specific building by ID
  const getBuilding = useCallback((buildingId: string): BuildingInstance | undefined => {
    return buildings.find(b => b.id === buildingId);
  }, [buildings]);

  // Get buildings by type
  const getBuildingsByType = useCallback((type: string): BuildingInstance[] => {
    return buildings.filter(b => b.type === type);
  }, [buildings]);

  // Check if a building is under construction
  const isUnderConstruction = useCallback((buildingId: string): boolean => {
    const building = getBuilding(buildingId);
    return building?.isUnderConstruction || false;
  }, [getBuilding]);

  // Check if a building is being upgraded
  const isUpgrading = useCallback((buildingId: string): boolean => {
    const building = getBuilding(buildingId);
    return !!building?.upgradeEndsAt && new Date(building.upgradeEndsAt) > new Date();
  }, [getBuilding]);

  // Get time remaining for construction/upgrade
  const getTimeRemaining = useCallback((buildingId: string): number => {
    const building = getBuilding(buildingId);
    if (!building) return 0;
    
    const endTime = building.constructionEndsAt || building.upgradeEndsAt;
    if (!endTime) return 0;
    
    const endDate = new Date(endTime).getTime();
    const now = new Date().getTime();
    return Math.max(0, Math.ceil((endDate - now) / 1000)); // Return seconds remaining
  }, [getBuilding]);

  // Format time remaining as HH:MM:SS
  const formatTimeRemaining = useCallback((buildingId: string): string => {
    const seconds = getTimeRemaining(buildingId);
    if (seconds <= 0) return 'Complete';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  }, [getTimeRemaining]);

  // Construct a new building
  const { mutate: construct, isPending: isConstructing } = useMutation({
    mutationFn: ({ type, position }: { type: string; position: { x: number; y: number } }) =>
      villageAPI.constructBuilding(villageId, type, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
      toast({
        title: 'Construction Started',
        description: 'Your building is under construction.',
      });
    },
  });

  // Upgrade a building
  const { mutate: upgrade, isPending: isUpgrading } = useMutation({
    mutationFn: (buildingId: string) => villageAPI.upgradeBuilding(villageId, buildingId),
    onSuccess: (_, buildingId) => {
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
      toast({
        title: 'Upgrade Started',
        description: `Your ${getBuilding(buildingId)?.type} is being upgraded.`,
      });
    },
  });

  // Cancel construction/upgrade
  const { mutate: cancel, isPending: isCanceling } = useMutation({
    mutationFn: (buildingId: string) => villageAPI.cancelUpgrade(villageId, buildingId),
    onSuccess: (_, buildingId) => {
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
      toast({
        title: 'Construction Canceled',
        description: 'Your construction has been canceled and some resources have been refunded.',
      });
    },
  });

  // Update number of workers assigned to a building
  const { mutate: updateWorkers } = useMutation({
    mutationFn: ({ buildingId, workerCount }: { buildingId: string; workerCount: number }) =>
      villageAPI.updateWorkers(villageId, buildingId, workerCount),
    onSuccess: (_, { buildingId }) => {
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
    },
  });

  // Check if player can afford to build/upgrade
  const canAffordBuilding = (buildingType: BuildingType, level: number): boolean => {
    const cost = buildingType.levels[level]?.cost;
    return cost ? hasResources(cost) : false;
  };

  // Get building efficiency (0-1)
  const getEfficiency = useCallback((buildingId: string): number => {
    const building = getBuilding(buildingId);
    if (!building) return 0;
    
    // Base efficiency based on workers assigned
    let efficiency = building.assignedWorkers / 10; // Assuming 10 is max workers
    
    // Apply any penalties (e.g., damaged buildings, lack of resources)
    // Add your own logic here based on game mechanics
    
    return Math.min(1, Math.max(0, efficiency)); // Clamp between 0 and 1
  }, [getBuilding]);

  // Subscribe to building updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;
    
    const unsubscribe = useGame().subscribe('village:update', (data: { villageId: string }) => {
      if (data.villageId === villageId) {
        queryClient.invalidateQueries({ queryKey: ['village', villageId, 'buildings'] });
      }
    });
    
    return () => unsubscribe();
  }, [villageId, isConnected, queryClient]);

  return {
    // Data
    buildings,
    
    // Loading states
    isLoading,
    isConstructing,
    isUpgrading,
    isCanceling,
    
    // Errors
    error,
    
    // Actions
    construct,
    upgrade,
    cancel,
    updateWorkers,
    refetch,
    
    // Utilities
    getBuilding,
    getBuildingsByType,
    isUnderConstruction,
    isUpgrading: isUpgrading as (buildingId: string) => boolean, // Type assertion
    getTimeRemaining,
    formatTimeRemaining,
    canAffordBuilding,
    getEfficiency,
  };
};

// Hook to get a specific building by ID
export const useBuilding = (villageId: string, buildingId: string) => {
  const { buildings, ...rest } = useBuildings(villageId);
  const building = buildings.find(b => b.id === buildingId);
  
  return {
    building,
    ...rest,
  };
};
