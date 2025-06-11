// A falu állapotát leíró típusok

export interface VillageState {
  level: number;
  experience: number;
  population: number;
  maxPopulation: number;
  resources: {
    wood: number;
    stone: number;
    gold: number;
    food: number;
  };
  buildings: VillageBuilding[];
  lastUpdated: string;
}

export interface VillageBuilding {
  id: string;
  type: BuildingType;
  name: string;
  level: number;
  maxLevel: number;
  description: string;
  upgradeCost: ResourceCost;
  position: {
    gridColumn: string;
    gridRow: string;
  };
  constructionTime: number; // másodpercben
  isUnderConstruction: boolean;
  constructionEndTime?: string; // ISO dátum string
}

export interface ResourceCost {
  wood: number;
  stone: number;
  gold: number;
  food?: number;
}

export type BuildingType = 
  | 'townhall' 
  | 'barracks' 
  | 'market' 
  | 'farm' 
  | 'mine' 
  | 'lumbermill' 
  | 'house' 
  | 'warehouse' 
  | 'academy' 
  | 'wall';

// Épület típusonkénti adatok
export interface BuildingTypeData {
  id: BuildingType;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: ResourceCost;
  baseConstructionTime: number; // másodpercben
  icon: string; // ikon neve vagy komponens
  colorScheme: string; // Chakra UI színséma
  gridSize: {
    columns: number;
    rows: number;
  };
  unlockAtLevel: number; // melyik falu szinten lesz elérhető
}

// Játékos által elérhető építési helyek
export interface BuildSlot {
  id: string;
  position: {
    x: number;
    y: number;
  };
  isOccupied: boolean;
  buildingId?: string;
  unlockAtLevel: number;
}

// Fejlesztési kutatás típusa
export interface Research {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  currentLevel: number;
  cost: ResourceCost;
  researchTime: number; // másodpercben
  requiredBuilding: {
    type: BuildingType;
    level: number;
  };
  effects: {
    type: 'resourceProduction' | 'buildingBonus' | 'unitBonus' | 'global';
    target: string; // pl. 'woodProduction', 'building.constructionTime', 'unit.attack'
    value: number; // százalékos vagy abszolút érték
    isPercentage: boolean;
  }[];
}

// Falu események (építések, fejlesztések, támadások stb.)
export interface VillageEvent {
  id: string;
  type: 'construction' | 'upgrade' | 'attack' | 'trade' | 'research';
  targetId: string;
  targetName: string;
  startTime: string; // ISO dátum string
  endTime: string; // ISO dátum string
  isCompleted: boolean;
  data?: any; // típusfüggő további adatok
}

// Falu fejlesztési követelményei szintekhez
export interface VillageLevelRequirement {
  level: number;
  requiredBuildings: {
    type: BuildingType;
    level: number;
  }[];
  requiredResearch?: {
    researchId: string;
    level: number;
  }[];
  requiredResources: ResourceCost;
  requiredTime: number; // másodpercben
  rewards: {
    type: 'buildingSlot' | 'resourceProduction' | 'population' | 'item';
    value: any;
  }[];
}
