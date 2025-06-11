import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { researchAPI } from '../services/api';
import { toast } from '../components/ui/use-toast';
import { useGame } from '../contexts/GameContext';
import { useEffect } from 'react';

export interface ResearchTechnology {
  id: string;
  name: string;
  description: string;
  category: 'economy' | 'military' | 'science' | 'infrastructure';
  maxLevel: number;
  currentLevel: number;
  isResearched: boolean;
  isResearching: boolean;
  researchTime: number; // Base time in seconds
  requirements: Array<{
    technologyId: string;
    level: number;
  }>;
  cost: Array<{
    resource: 'gold' | 'wood' | 'stone' | 'iron' | 'food' | 'knowledge';
    amount: number;
  }>;
  benefits: Array<{
    type: 'production' | 'storage' | 'combat' | 'unlock' | 'efficiency' | 'other';
    target: string;
    value: number;
    isPercentage: boolean;
  }>;
  researchEndsAt?: string;
  icon: string;
}

export const useResearch = () => {
  const queryClient = useQueryClient();
  const { isConnected } = useGame();
  
  // Get all available technologies
  const {
    data: technologies = [],
    isLoading,
    error,
    refetch,
  } = useQuery<ResearchTechnology[]>({
    queryKey: ['research', 'technologies'],
    queryFn: () => researchAPI.getTechnologies().then(res => res.data),
    staleTime: 300000, // 5 minutes
    refetchInterval: isConnected ? false : 300000, // Only poll if not using WebSocket
  });

  // Get currently researching technology
  const { data: currentResearch } = useQuery<ResearchTechnology | null>({
    queryKey: ['research', 'current'],
    queryFn: () => researchAPI.getCurrentResearch().then(res => res.data),
    refetchInterval: isConnected ? false : 10000, // Check every 10 seconds if not using WebSocket
  });

  // Start researching a technology
  const { mutate: startResearch, isPending: isStarting } = useMutation({
    mutationFn: (technologyId: string) => researchAPI.startResearch(technologyId),
    onSuccess: (_, technologyId) => {
      queryClient.invalidateQueries({ queryKey: ['research', 'technologies'] });
      queryClient.invalidateQueries({ queryKey: ['research', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['village', 'resources'] });
      
      const tech = technologies.find(t => t.id === technologyId);
      if (tech) {
        toast({
          title: 'Research Started',
          description: `Researching ${tech.name} has begun.`,
        });
      }
    },
  });

  // Cancel current research
  const { mutate: cancelResearch, isPending: isCanceling } = useMutation({
    mutationFn: () => researchAPI.cancelResearch(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research', 'technologies'] });
      queryClient.invalidateQueries({ queryKey: ['research', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['village', 'resources'] });
      
      toast({
        title: 'Research Canceled',
        description: 'Your research has been canceled and some resources have been refunded.',
      });
    },
  });

  // Get time remaining for current research
  const getResearchTimeRemaining = (): number => {
    if (!currentResearch?.researchEndsAt) return 0;
    
    const endTime = new Date(currentResearch.researchEndsAt).getTime();
    const now = new Date().getTime();
    return Math.max(0, Math.ceil((endTime - now) / 1000)); // Return seconds remaining
  };

  // Format time remaining as HH:MM:SS
  const formatResearchTimeRemaining = (): string => {
    const seconds = getResearchTimeRemaining();
    if (seconds <= 0) return 'Research Complete';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Get research progress (0-1)
  const getResearchProgress = (): number => {
    if (!currentResearch?.researchEndsAt || !currentResearch.researchTime) return 0;
    
    const totalTime = currentResearch.researchTime * 1000; // Convert to milliseconds
    const remaining = getResearchTimeRemaining() * 1000; // Convert to milliseconds
    const elapsed = Math.max(0, totalTime - remaining);
    
    return Math.min(1, Math.max(0, elapsed / totalTime));
  };

  // Check if a technology can be researched (requirements met)
  const canResearchTechnology = (technology: ResearchTechnology): { canResearch: boolean; reason?: string } => {
    if (technology.isResearched) {
      return { canResearch: false, reason: 'Already researched' };
    }
    
    if (technology.currentLevel >= technology.maxLevel) {
      return { canResearch: false, reason: 'Maximum level reached' };
    }
    
    // Check requirements
    for (const req of technology.requirements) {
      const reqTech = technologies.find(t => t.id === req.technologyId);
      if (!reqTech || reqTech.currentLevel < req.level) {
        return { 
          canResearch: false, 
          reason: `Requires ${reqTech?.name || 'Technology'} Level ${req.level}` 
        };
      }
    }
    
    // Check if another research is already in progress
    if (currentResearch && !technology.isResearching) {
      return { 
        canResearch: false, 
        reason: 'Another research is already in progress' 
      };
    }
    
    return { canResearch: true };
  };

  // Get technologies by category
  const getTechnologiesByCategory = (category?: string) => {
    return technologies.filter(tech => 
      !category || tech.category === category
    );
  };

  // Get unlocked technologies
  const getUnlockedTechnologies = () => {
    return technologies.filter(tech => tech.isResearched);
  };

  // Get research queue
  const getResearchQueue = () => {
    return technologies.filter(tech => tech.isResearching);
  };

  // Subscribe to research updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;
    
    const unsubscribe = useGame().subscribe('research:update', () => {
      queryClient.invalidateQueries({ queryKey: ['research', 'technologies'] });
      queryClient.invalidateQueries({ queryKey: ['research', 'current'] });
    });
    
    return () => unsubscribe();
  }, [isConnected, queryClient]);

  return {
    // Data
    technologies,
    currentResearch,
    
    // Loading states
    isLoading,
    isStarting,
    isCanceling,
    
    // Errors
    error,
    
    // Actions
    startResearch,
    cancelResearch,
    refetch,
    
    // Utilities
    getResearchTimeRemaining,
    formatResearchTimeRemaining,
    getResearchProgress,
    canResearchTechnology,
    getTechnologiesByCategory,
    getUnlockedTechnologies,
    getResearchQueue,
  };
};

// Hook to get a specific technology
export const useTechnology = (technologyId: string) => {
  const { technologies, ...rest } = useResearch();
  const technology = technologies.find(t => t.id === technologyId);
  
  return {
    technology,
    ...rest,
  };
};
