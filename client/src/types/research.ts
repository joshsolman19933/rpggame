export interface ResearchPrerequisite {
  researchId?: string;
  buildingId?: string;
  buildingLevel?: number;
  villageLevel?: number;
}

export interface ResearchEffect {
  type: 'BUFF_PRODUCTION' | 'UNLOCK_BUILDING' | 'UNLOCK_UNIT' | 'REDUCE_UPGRADE_TIME' | 'REDUCE_RESEARCH_TIME' | 'INCREASE_STORAGE' | 'SPECIAL_ABILITY';
  targetId?: string; // Building ID, Unit ID, etc.
  value?: number; // Percentage, fixed value, etc.
  resourceType?: 'wood' | 'stone' | 'iron' | 'gold' | 'food';
  description: string;
}

export interface Research {
  id: string;
  name: string;
  description: string;
  category: 'economy' | 'military' | 'defense' | 'infrastructure' | 'magic';
  level: number;
  maxLevel: number;
  icon: string;
  isResearched: boolean;
  isResearching: boolean;
  researchTime: number; // in seconds
  researchEndsAt?: string; // ISO date string
  prerequisites: ResearchPrerequisite[];
  effects: ResearchEffect[];
  cost: {
    wood: number;
    stone: number;
    iron: number;
    gold: number;
    food: number;
  };
  requiredBuildings: {
    buildingId: string;
    level: number;
  }[];
  requiredVillageLevel: number;
}

export interface ResearchProgress {
  researchId: string;
  currentLevel: number;
  completed: boolean;
  researching: boolean;
  researchEndsAt?: string;
}

export interface ResearchData {
  availableResearches: Research[];
  completedResearchIds: string[];
  researchInProgress?: {
    researchId: string;
    endsAt: string;
  };
  researchQueue: string[];
  maxQueueSize: number;
}
