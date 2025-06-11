import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { achievementAPI } from '../services/api';
import { Achievement } from '../types/game';
import { toast } from '../components/ui/use-toast';

export const useAchievements = () => {
  const queryClient = useQueryClient();

  // Get all available achievements
  const {
    data: allAchievements = [],
    isLoading: isLoadingAll,
    error: allError,
  } = useQuery<Achievement[]>({
    queryKey: ['achievements'],
    queryFn: () => achievementAPI.getAchievements().then(res => res.data),
  });

  // Get player's achievements
  const {
    data: playerAchievements = [],
    isLoading: isLoadingPlayer,
    error: playerError,
    refetch: refetchPlayerAchievements,
  } = useQuery<Achievement[]>({
    queryKey: ['player', 'achievements'],
    queryFn: () => achievementAPI.getPlayerAchievements().then(res => res.data),
  });

  // Claim achievement reward
  const { mutate: claimReward, isPending: isClaiming } = useMutation({
    mutationFn: (achievementId: string) => 
      achievementAPI.claimAchievementReward(achievementId),
    onSuccess: (_, achievementId) => {
      // Invalidate both queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['player', 'achievements'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      
      // Show success toast with the claimed achievement
      const claimed = [...(playerAchievements || []), ...(allAchievements || [])]
        .find(a => a.id === achievementId);
      
      if (claimed) {
        toast({
          title: 'Achievement Unlocked!',
          description: `You've claimed the reward for: ${claimed.name}`,
          variant: 'success',
        });
      }
    },
  });

  // Get achievement progress
  const getAchievementProgress = (achievementId: string) => {
    const playerAchievement = playerAchievements?.find(a => a.id === achievementId);
    const achievement = allAchievements?.find(a => a.id === achievementId);
    
    if (!achievement) return { progress: 0, isCompleted: false, isClaimed: false };
    
    if (!playerAchievement) {
      return {
        progress: 0,
        isCompleted: false,
        isClaimed: false,
        ...achievement,
      };
    }
    
    const progress = Math.min(
      (playerAchievement.currentValue / playerAchievement.targetValue) * 100,
      100
    );
    
    return {
      progress,
      isCompleted: playerAchievement.isCompleted,
      isClaimed: playerAchievement.isClaimed,
      ...achievement,
      ...playerAchievement,
    };
  };

  // Get achievements by category
  const getAchievementsByCategory = (category?: string) => {
    return (allAchievements || [])
      .filter(achievement => !category || achievement.category === category)
      .map(achievement => ({
        ...achievement,
        ...getAchievementProgress(achievement.id as string),
      }));
  };

  // Get completed achievements
  const completedAchievements = (playerAchievements || [])
    .filter(a => a.isCompleted);

  // Get unclaimed achievements
  const unclaimedAchievements = (playerAchievements || [])
    .filter(a => a.isCompleted && !a.isClaimed);

  return {
    // Data
    allAchievements,
    playerAchievements,
    completedAchievements,
    unclaimedAchievements,
    
    // Loading states
    isLoading: isLoadingAll || isLoadingPlayer,
    isClaiming,
    
    // Errors
    error: allError || playerError,
    
    // Actions
    claimReward,
    getAchievementProgress,
    getAchievementsByCategory,
    refetchPlayerAchievements,
  };
};

// Hook to track achievement notifications
export const useAchievementNotifications = () => {
  const { unclaimedAchievements, claimReward } = useAchievements();
  
  // This effect would be used to show notifications for new achievements
  // when they are unlocked (you would implement the actual notification logic)
  
  return {
    unclaimedAchievements,
    claimReward,
  };
};
