import { Research, ResearchData, ResearchProgress } from '../types/research';
import { v4 as uuidv4 } from 'uuid';

// Mock data for researches
const mockResearches: Research[] = [
  {
    id: 'wood_processing',
    name: 'Faipari technológiák',
    description: 'Növeli a favágók termelékenységét.',
    category: 'economy',
    level: 0,
    maxLevel: 10,
    icon: '🪓',
    isResearched: false,
    isResearching: false,
    researchTime: 300, // 5 minutes
    prerequisites: [],
    effects: [
      {
        type: 'BUFF_PRODUCTION',
        targetId: 'lumberjack',
        value: 0.1, // 10% increase per level
        resourceType: 'wood',
        description: 'Növeli a favágók termelését 10%-kal szintenként.'
      }
    ],
    cost: {
      wood: 100,
      stone: 50,
      iron: 20,
      gold: 50,
      food: 20
    },
    requiredBuildings: [
      { buildingId: 'academy', level: 1 }
    ],
    requiredVillageLevel: 2
  },
  {
    id: 'masonry',
    name: 'Kőművesség',
    description: 'Növeli a kőbányák termelékenységét.',
    category: 'economy',
    level: 0,
    maxLevel: 10,
    icon: '⛏️',
    isResearched: false,
    isResearching: false,
    researchTime: 360, // 6 minutes
    prerequisites: [],
    effects: [
      {
        type: 'BUFF_PRODUCTION',
        targetId: 'quarry',
        value: 0.1,
        resourceType: 'stone',
        description: 'Növeli a kőbányák termelését 10%-kal szintenként.'
      }
    ],
    cost: {
      wood: 80,
      stone: 120,
      iron: 30,
      gold: 40,
      food: 20
    },
    requiredBuildings: [
      { buildingId: 'academy', level: 1 }
    ],
    requiredVillageLevel: 2
  },
  // Add more researches...
  {
    id: 'military_training',
    name: 'Katonai kiképzés',
    description: 'Növeli a katonai egységek életerejét és támadási értékét.',
    category: 'military',
    level: 0,
    maxLevel: 5,
    icon: '⚔️',
    isResearched: false,
    isResearching: false,
    researchTime: 1800, // 30 minutes
    prerequisites: [
      { buildingId: 'barracks', level: 3 }
    ],
    effects: [
      {
        type: 'SPECIAL_ABILITY',
        description: 'Növeli az összes katonai egység életerejét és támadási értékét 5%-kal szintenként.'
      }
    ],
    cost: {
      wood: 200,
      stone: 150,
      iron: 300,
      gold: 400,
      food: 100
    },
    requiredBuildings: [
      { buildingId: 'academy', level: 3 },
      { buildingId: 'barracks', level: 3 }
    ],
    requiredVillageLevel: 5
  }
];

export const fetchResearches = async (): Promise<ResearchData> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        availableResearches: mockResearches,
        completedResearchIds: [],
        researchQueue: [],
        maxQueueSize: 3
      });
    }, 500);
  });
};

export const startResearch = async (researchId: string): Promise<{ success: boolean; message?: string }> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const research = mockResearches.find(r => r.id === researchId);
      if (research) {
        research.isResearching = true;
        research.researchEndsAt = new Date(Date.now() + research.researchTime * 1000).toISOString();
        resolve({ success: true });
      } else {
        resolve({ success: false, message: 'Kutatás nem található' });
      }
    }, 500);
  });
};

export const cancelResearch = async (researchId: string): Promise<{ success: boolean; message?: string }> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const research = mockResearches.find(r => r.id === researchId);
      if (research) {
        research.isResearching = false;
        delete research.researchEndsAt;
        resolve({ success: true });
      } else {
        resolve({ success: false, message: 'Kutatás nem található' });
      }
    }, 500);
  });
};

export const completeResearch = async (researchId: string): Promise<{ success: boolean; message?: string; rewards?: any }> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const research = mockResearches.find(r => r.id === researchId);
      if (research) {
        research.isResearching = false;
        research.isResearched = true;
        research.level++;
        delete research.researchEndsAt;
        
        // In a real app, apply the research effects here
        const rewards = {
          message: `${research.name} kutatása befejeződött!`,
          effects: research.effects.map(effect => effect.description)
        };
        
        resolve({ success: true, rewards });
      } else {
        resolve({ success: false, message: 'Kutatás nem található' });
      }
    }, 500);
  });
};

export const getResearchProgress = (researchId: string): ResearchProgress | null => {
  // In a real app, this would be calculated based on the current time and research end time
  const research = mockResearches.find(r => r.id === researchId);
  if (!research) return null;
  
  return {
    researchId,
    currentLevel: research.level,
    completed: research.isResearched,
    researching: research.isResearching,
    researchEndsAt: research.researchEndsAt
  };
};
