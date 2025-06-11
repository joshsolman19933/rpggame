import { ObjectId } from 'mongoose';

export type ResourceType = 'gold' | 'wood' | 'stone' | 'iron' | 'food';

export interface Position {
  x: number;
  y: number;
}

export interface BuildingLevel {
  level: number;
  cost: Record<ResourceType, number>;
  production?: Partial<Record<ResourceType, number>>;
  storage?: Partial<Record<ResourceType, number>>;
  buildTime: number; // in seconds
  description: string;
  requirements?: {
    buildingLevels?: Record<string, number>;
    playerLevel?: number;
  };
}

export interface BuildingType {
  id: string;
  name: string;
  description: string;
  category: 'resource' | 'military' | 'infrastructure' | 'defense' | 'special';
  maxLevel: number;
  levels: Record<number, BuildingLevel>;
  size: { width: number; height: number };
  buildableOn: ('land' | 'water' | 'mountain')[];
  workerSlots: number;
  sprite: {
    base: string;
    levels: Record<number, string>;
  };
  effects?: {
    globalProduction?: Partial<Record<ResourceType, number>>;
    storageBonus?: Partial<Record<ResourceType, number>>;
    unitProduction?: Record<string, number>;
    researchBonus?: Record<string, number>;
  };
}

export interface BuildingInstance {
  id: string | ObjectId;
  type: string;
  level: number;
  position: Position;
  isUnderConstruction: boolean;
  constructionEndsAt?: Date;
  upgradeEndsAt?: Date;
  assignedWorkers: number;
  lastCollectedAt: Date;
  efficiency: number; // 0-1 multiplier based on happiness, upgrades, etc.
}

export interface VillageResources {
  gold: number;
  wood: number;
  stone: number;
  iron: number;
  food: number;
  lastUpdated: Date;
  storage: {
    gold: number;
    wood: number;
    stone: number;
    iron: number;
    food: number;
  };
  production: {
    gold: number;
    wood: number;
    stone: number;
    iron: number;
    food: number;
  };
  consumption: {
    food: number;
  };
}

export interface PlayerStats {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  attack: number;
  defense: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  stamina: number;
  maxStamina: number;
  lastEnergyUpdate: Date;
  lastStaminaUpdate: Date;
}

export interface Achievement {
  id: string | ObjectId;
  name: string;
  description: string;
  icon: string;
  category: 'building' | 'combat' | 'economy' | 'social' | 'special';
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  isClaimed: boolean;
  rewards: {
    experience?: number;
    resources?: Partial<Record<ResourceType, number>>;
    items?: Array<{ itemId: string; quantity: number }>;
  };
  requirements: Array<{
    type: 'buildingLevel' | 'resourceCollected' | 'enemyDefeated' | 'questCompleted';
    target: string;
    value: number;
  }>;
  hidden: boolean;
  order: number;
}

export interface GameEvent {
  id: string | ObjectId;
  type: 'system' | 'combat' | 'economy' | 'social' | 'achievement' | 'alliance';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  data?: Record<string, any>;
  actions?: Array<{
    label: string;
    action: string;
    params: Record<string, any>;
  }>;
}

export interface Notification {
  id: string | ObjectId;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'combat' | 'alliance';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  link?: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expiresAt?: Date;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string | ObjectId;
  playerName: string;
  avatar?: string;
  score: number;
  level: number;
  villageName?: string;
  allianceName?: string;
  isOnline: boolean;
  lastActive: Date;
}

export interface Leaderboard {
  type: 'players' | 'villages' | 'alliances';
  season: number;
  lastUpdated: Date;
  entries: LeaderboardEntry[];
  playerRank?: number;
  totalPlayers: number;
}
