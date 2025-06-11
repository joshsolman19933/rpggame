export interface Building {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  upgradeTime: number; // másodpercben
  upgradeCost: {
    wood: number;
    stone: number;
    iron: number;
    gold: number;
  };
  productionRate: number; // mennyit termel másodpercenként
  isUpgrading: boolean;
  upgradeEndsAt?: string; // ISO dátum string
  image?: string;
  category: 'resource' | 'military' | 'infrastructure' | 'defense';
  requirements?: {
    buildingId: string;
    level: number;
  }[];
}

export interface VillageData {
  id: string;
  name: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  resources: {
    wood: number;
    stone: number;
    iron: number;
    gold: number;
    food: number;
    capacity: number;
  };
  buildings: Building[];
  lastUpdated: string;
}
