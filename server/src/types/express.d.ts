import { UserDocument } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface VillageCoords {
  x: number;
  y: number;
  region: string;
}

export interface BuildingPosition {
  x: number;
  y: number;
}

export interface Building {
  _id?: mongoose.Types.ObjectId;
  type: string;
  level: number;
  position: BuildingPosition;
  lastUpgraded?: Date;
  isUnderConstruction?: boolean;
}

export interface Resources {
  gold: number;
  wood: number;
  stone: number;
  iron: number;
  food: number;
  lastUpdated: Date;
}

export interface Population {
  current: number;
  max: number;
}

export interface VillageDocument extends mongoose.Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  coordinates: VillageCoords;
  buildings: Building[];
  resources: Resources;
  population: Population;
  lastActive: Date;
  isActive: boolean;
  description?: string;
  avatar?: string;
  difficulty?: 'easy' | 'normal' | 'hard';
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  updateBuilding(buildingId: string, updateData: Partial<Building>): Promise<this>;
  
  // Virtuals
  totalBuildingLevels: number;
}

export interface VillageModel extends mongoose.Model<VillageDocument> {
  // Statics
  findByUserId(userId: string): Promise<VillageDocument | null>;
}
