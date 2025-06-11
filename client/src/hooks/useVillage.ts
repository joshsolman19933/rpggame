import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { villageAPI } from '../services/api';
import { BuildingType, VillageResources, BuildingInstance } from '../types/game';

export const useVillage = (villageId: string) => {
  const queryClient = useQueryClient();

  // Get village data
  const {
    data: village,
    isLoading: isLoadingVillage,
    error: villageError,
  } = useQuery({
    queryKey: ['village', villageId],
    queryFn: () => villageAPI.getVillage(villageId).then(res => res.data),
    enabled: !!villageId,
  });

  // Get village buildings
  const {
    data: buildings = [],
    isLoading: isLoadingBuildings,
    error: buildingsError,
  } = useQuery<BuildingInstance[]>({
    queryKey: ['village', villageId, 'buildings'],
    queryFn: () => villageAPI.getBuildings(villageId).then(res => res.data),
    enabled: !!villageId,
  });

  // Get village resources
  const {
    data: resources,
    isLoading: isLoadingResources,
    error: resourcesError,
  } = useQuery<VillageResources>({
    queryKey: ['village', villageId, 'resources'],
    queryFn: () => villageAPI.getResources(villageId).then(res => res.data),
    enabled: !!villageId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Construct a new building
  const { mutate: constructBuilding, isPending: isConstructing } = useMutation({
    mutationFn: ({ type, position }: { type: string; position: { x: number; y: number } }) =>
      villageAPI.constructBuilding(villageId, type, position),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
    },
  });

  // Upgrade a building
  const { mutate: upgradeBuilding, isPending: isUpgrading } = useMutation({
    mutationFn: (buildingId: string) => villageAPI.upgradeBuilding(villageId, buildingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
    },
  });

  // Cancel building upgrade
  const { mutate: cancelUpgrade, isPending: isCanceling } = useMutation({
    mutationFn: (buildingId: string) => villageAPI.cancelUpgrade(villageId, buildingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
    },
  });

  // Update workers
  const { mutate: updateWorkers } = useMutation({
    mutationFn: ({ buildingId, workerCount }: { buildingId: string; workerCount: number }) =>
      villageAPI.updateWorkers(villageId, buildingId, workerCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
    },
  });

  // Collect resources
  const { mutate: collectResources } = useMutation({
    mutationFn: (resourceType: string) => villageAPI.collectResources(villageId, resourceType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['village', villageId, 'resources'] });
    },
  });

  return {
    village,
    buildings,
    resources,
    isLoading: isLoadingVillage || isLoadingBuildings || isLoadingResources,
    error: villageError || buildingsError || resourcesError,
    
    // Mutations
    constructBuilding,
    upgradeBuilding,
    cancelUpgrade,
    updateWorkers,
    collectResources,
    isConstructing,
    isUpgrading,
    isCanceling,
  };
};

// Hook to get building types
export const useBuildingTypes = () => {
  return useQuery<BuildingType[]>({
    queryKey: ['buildingTypes'],
    queryFn: () => villageAPI.getBuildingTypes().then(res => res.data),
    staleTime: Infinity, // Building types rarely change
  });
};

// Hook to get a specific building type
export const useBuildingType = (typeId: string) => {
  const { data: buildingTypes } = useBuildingTypes();
  return buildingTypes?.find(type => type.id === typeId);
};
