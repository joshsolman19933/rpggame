import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playerAPI } from '../services/api';
import { toast } from '../components/ui/use-toast';

export const usePlayer = (playerId?: string) => {
  const queryClient = useQueryClient();
  const effectivePlayerId = playerId || 'me'; // Default to current player if no ID provided

  // Get player profile
  const {
    data: player,
    isLoading: isLoadingPlayer,
    error: playerError,
  } = useQuery({
    queryKey: ['player', effectivePlayerId],
    queryFn: () => 
      playerAPI.getProfile().then(res => res.data),
    enabled: !playerId, // Only enable for current player if no ID is provided
  });

  // Get player skills
  const {
    data: skills = [],
    isLoading: isLoadingSkills,
    error: skillsError,
  } = useQuery({
    queryKey: ['player', effectivePlayerId, 'skills'],
    queryFn: () => 
      playerAPI.getSkills().then(res => res.data),
    enabled: !playerId, // Only enable for current player
  });

  // Get player inventory
  const {
    data: inventory = [],
    isLoading: isLoadingInventory,
    error: inventoryError,
  } = useQuery({
    queryKey: ['player', effectivePlayerId, 'inventory'],
    queryFn: () => 
      playerAPI.getInventory().then(res => res.data),
    enabled: !playerId, // Only enable for current player
  });

  // Update player profile
  const { mutate: updateProfile } = useMutation({
    mutationFn: (updateData: any) => playerAPI.updateProfile(updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', effectivePlayerId] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
  });

  // Upgrade skill
  const { mutate: upgradeSkill, isPending: isUpgradingSkill } = useMutation({
    mutationFn: (skillId: string) => playerAPI.upgradeSkill(skillId),
    onSuccess: (_, skillId) => {
      queryClient.invalidateQueries({ queryKey: ['player', effectivePlayerId, 'skills'] });
      queryClient.invalidateQueries({ queryKey: ['player', effectivePlayerId] });
      toast({
        title: 'Skill upgraded',
        description: `Your skill has been upgraded to the next level.`,
      });
    },
  });

  // Use item
  const { mutate: useItem } = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity?: number }) => 
      playerAPI.useItem(itemId, quantity),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['player', effectivePlayerId, 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['player', effectivePlayerId] });
      toast({
        title: 'Item used',
        description: 'The item has been used successfully.',
      });
    },
  });

  // Equip item
  const { mutate: equipItem } = useMutation({
    mutationFn: (itemId: string) => playerAPI.equipItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', effectivePlayerId, 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['player', effectivePlayerId] });
    },
  });

  // Unequip item
  const { mutate: unequipItem } = useMutation({
    mutationFn: (itemId: string) => playerAPI.unequipItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', effectivePlayerId, 'inventory'] });
      queryClient.invalidateQueries({ queryKey: ['player', effectivePlayerId] });
    },
  });

  return {
    // Data
    player,
    skills,
    inventory,
    
    // Loading states
    isLoading: isLoadingPlayer || isLoadingSkills || isLoadingInventory,
    isUpgradingSkill,
    
    // Errors
    error: playerError || skillsError || inventoryError,
    
    // Actions
    updateProfile,
    upgradeSkill,
    useItem,
    equipItem,
    unequipItem,
  };
};

// Hook to get a specific player by ID
export const usePlayerById = (playerId: string) => {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: () => 
      // In a real app, you would have an API endpoint to fetch other players
      // For now, we'll just return null
      Promise.resolve({ data: null }),
    enabled: !!playerId,
  });
};
