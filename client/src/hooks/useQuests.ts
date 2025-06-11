import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questsAPI } from '../services/api';
import { toast } from '../components/ui/use-toast';
import { useGame } from '../contexts/GameContext';
import { useEffect, useCallback } from 'react';

export interface QuestRequirement {
  type: 'building' | 'research' | 'unit' | 'resource' | 'combat' | 'other';
  targetId: string;
  targetName: string;
  targetLevel?: number;
  requiredAmount: number;
  currentAmount: number;
  isCompleted: boolean;
}

export interface QuestReward {
  type: 'experience' | 'resources' | 'items' | 'unlocks' | 'other';
  resourceType?: 'gold' | 'wood' | 'stone' | 'iron' | 'food' | 'gems';
  itemId?: string;
  itemName?: string;
  amount: number;
  isClaimed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'main' | 'side' | 'daily' | 'achievement' | 'event';
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  isCompleted: boolean;
  isClaimed: boolean;
  isRepeatable: boolean;
  cooldown?: number; // in seconds, for repeatable quests
  availableAt?: string; // ISO timestamp
  expiresAt?: string; // ISO timestamp, for time-limited quests
  sortOrder: number;
  icon: string;
}

export const useQuests = () => {
  const queryClient = useQueryClient();
  const { isConnected } = useGame();
  
  // Get all available quests
  const {
    data: allQuests = [],
    isLoading: isLoadingAllQuests,
    error: allQuestsError,
  } = useQuery<Quest[]>({
    queryKey: ['quests', 'all'],
    queryFn: () => questsAPI.getAllQuests().then(res => res.data),
    staleTime: 300000, // 5 minutes
  });

  // Get player's active quests
  const {
    data: activeQuests = [],
    isLoading: isLoadingActiveQuests,
    error: activeQuestsError,
    refetch: refetchActiveQuests,
  } = useQuery<Quest[]>({
    queryKey: ['quests', 'active'],
    queryFn: () => questsAPI.getActiveQuests().then(res => res.data),
    refetchInterval: isConnected ? false : 60000, // 1 minute if not using WebSocket
  });

  // Get completed quests
  const {
    data: completedQuests = [],
    isLoading: isLoadingCompletedQuests,
    error: completedQuestsError,
    refetch: refetchCompletedQuests,
  } = useQuery<Quest[]>({
    queryKey: ['quests', 'completed'],
    queryFn: () => questsAPI.getCompletedQuests().then(res => res.data),
    staleTime: 300000, // 5 minutes
  });

  // Accept a quest
  const { mutate: acceptQuest, isPending: isAccepting } = useMutation({
    mutationFn: (questId: string) => questsAPI.acceptQuest(questId),
    onSuccess: (_, questId) => {
      queryClient.invalidateQueries({ queryKey: ['quests', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['quests', 'active'] });
      
      const quest = allQuests.find(q => q.id === questId);
      if (quest) {
        toast({
          title: 'Quest Accepted',
          description: `You've accepted the quest: ${quest.title}`,
        });
      }
    },
  });

  // Abandon a quest
  const { mutate: abandonQuest, isPending: isAbandoning } = useMutation({
    mutationFn: (questId: string) => questsAPI.abandonQuest(questId),
    onSuccess: (_, questId) => {
      queryClient.invalidateQueries({ queryKey: ['quests', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['quests', 'active'] });
      
      const quest = activeQuests.find(q => q.id === questId);
      if (quest) {
        toast({
          title: 'Quest Abandoned',
          description: `You've abandoned the quest: ${quest.title}`,
          variant: 'destructive',
        });
      }
    },
  });

  // Claim quest rewards
  const { mutate: claimRewards, isPending: isClaiming } = useMutation({
    mutationFn: (questId: string) => questsAPI.claimQuestRewards(questId),
    onSuccess: (_, questId) => {
      queryClient.invalidateQueries({ queryKey: ['quests', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['quests', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['quests', 'completed'] });
      queryClient.invalidateQueries({ queryKey: ['player', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['village', 'resources'] });
      
      const quest = [...activeQuests, ...completedQuests].find(q => q.id === questId);
      if (quest) {
        toast({
          title: 'Rewards Claimed',
          description: `You've claimed the rewards for: ${quest.title}`,
        });
      }
    },
  });

  // Get quest progress
  const getQuestProgress = useCallback((quest: Quest): { progress: number; isCompleted: boolean } => {
    if (quest.isCompleted) return { progress: 100, isCompleted: true };
    
    const totalRequirements = quest.requirements.length;
    if (totalRequirements === 0) return { progress: 0, isCompleted: false };
    
    const completedRequirements = quest.requirements.filter(r => r.isCompleted).length;
    const progress = Math.round((completedRequirements / totalRequirements) * 100);
    
    return {
      progress,
      isCompleted: completedRequirements === totalRequirements,
    };
  }, []);

  // Get quests by category
  const getQuestsByCategory = useCallback((category?: string) => {
    const quests = category ? allQuests.filter(q => q.category === category) : allQuests;
    
    return quests.map(quest => ({
      ...quest,
      progress: getQuestProgress(quest),
    }));
  }, [allQuests, getQuestProgress]);

  // Get available quests (not yet accepted)
  const getAvailableQuests = useCallback(() => {
    return allQuests.filter(
      quest => 
        !activeQuests.some(aq => aq.id === quest.id) &&
        !completedQuests.some(cq => cq.id === quest.id) &&
        (!quest.availableAt || new Date(quest.availableAt) <= new Date()) &&
        (!quest.expiresAt || new Date(quest.expiresAt) > new Date())
    );
  }, [allQuests, activeQuests, completedQuests]);

  // Check if a quest is available to the player
  const isQuestAvailable = useCallback((quest: Quest): boolean => {
    // Check if already completed and not repeatable
    if (quest.isCompleted && !quest.isRepeatable) return false;
    
    // Check if available time window
    if (quest.availableAt && new Date(quest.availableAt) > new Date()) return false;
    if (quest.expiresAt && new Date(quest.expiresAt) <= new Date()) return false;
    
    // Check if already accepted or completed
    if (activeQuests.some(q => q.id === quest.id)) return false;
    if (completedQuests.some(q => q.id === quest.id && !quest.isRepeatable)) return false;
    
    // Check cooldown for repeatable quests
    if (quest.isRepeatable && quest.cooldown) {
      const completedQuest = completedQuests.find(q => q.id === quest.id);
      if (completedQuest) {
        const completedAt = new Date(completedQuest.expiresAt || 0).getTime();
        const now = new Date().getTime();
        const cooldownMs = quest.cooldown * 1000;
        
        if (now - completedAt < cooldownMs) return false;
      }
    }
    
    return true;
  }, [activeQuests, completedQuests]);

  // Subscribe to quest updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;
    
    const unsubscribe = useGame().subscribe('quest:update', () => {
      queryClient.invalidateQueries({ queryKey: ['quests', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['quests', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['quests', 'completed'] });
    });
    
    return () => unsubscribe();
  }, [isConnected, queryClient]);

  return {
    // Data
    allQuests,
    activeQuests,
    completedQuests,
    
    // Loading states
    isLoading: isLoadingAllQuests || isLoadingActiveQuests || isLoadingCompletedQuests,
    isAccepting,
    isAbandoning,
    isClaiming,
    
    // Errors
    error: allQuestsError || activeQuestsError || completedQuestsError,
    
    // Actions
    acceptQuest,
    abandonQuest,
    claimRewards,
    refetchActiveQuests,
    refetchCompletedQuests,
    
    // Utilities
    getQuestProgress,
    getQuestsByCategory,
    getAvailableQuests,
    isQuestAvailable,
  };
};

// Hook to get a specific quest
export const useQuest = (questId: string) => {
  const { allQuests, activeQuests, completedQuests, ...rest } = useQuests();
  const quest = [...allQuests, ...activeQuests, ...completedQuests].find(q => q.id === questId);
  
  return {
    quest,
    ...rest,
  };
};
