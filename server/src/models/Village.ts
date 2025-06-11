import mongoose, { Document, Model, Schema } from 'mongoose';

// Típusdefiníciók
interface IResources {
  gold: number;
  wood: number;
  stone: number;
  iron: number;
  food: number;
  lastUpdated: Date;
}

interface IPopulation {
  current: number;
  max: number;
}

interface IBuildingPosition {
  x: number;
  y: number;
}

interface IBuilding extends Document {
  type: string;
  level: number;
  position: IBuildingPosition;
  lastUpgraded?: Date;
  isUnderConstruction?: boolean;
}

interface IVillageCoords {
  x: number;
  y: number;
  region: string;
}

interface IVillage extends Document {
  name: string;
  userId: mongoose.Types.ObjectId;
  coordinates: IVillageCoords;
  buildings: IBuilding[];
  resources: IResources;
  population: IPopulation;
  lastActive: Date;
  isActive: boolean;
  description?: string;
  avatar?: string;
  difficulty?: 'easy' | 'normal' | 'hard';
  totalBuildingLevels: number;
  updateBuilding: (buildingId: string, updateData: Partial<IBuilding>) => Promise<IVillage>;
}

interface IVillageModel extends Model<IVillage> {
  findByUserId: (userId: string) => Promise<IVillage | null>;
}

// Séma definíciók
const buildingPositionSchema = new Schema<IBuildingPosition>({
  x: { type: Number, required: true, min: 0, max: 9 },
  y: { type: Number, required: true, min: 0, max: 9 }
}, { _id: false });

const buildingSchema = new Schema<IBuilding>({
  type: { 
    type: String, 
    required: true,
    enum: ['townhall', 'barracks', 'farm', 'mine', 'lumbermill', 'wall', 'warehouse', 'market', 'academy', 'temple']
  },
  level: { 
    type: Number, 
    required: true, 
    default: 1,
    min: 1,
    max: 20
  },
  position: { type: buildingPositionSchema, required: true },
  lastUpgraded: { type: Date },
  isUnderConstruction: { type: Boolean, default: false }
}, { _id: false });

const resourcesSchema = new Schema<IResources>({
  gold: { type: Number, default: 200 },
  wood: { type: Number, default: 200 },
  stone: { type: Number, default: 100 },
  iron: { type: Number, default: 50 },
  food: { type: Number, default: 300 },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const populationSchema = new Schema<IPopulation>({
  current: { type: Number, default: 10 },
  max: { type: Number, default: 20 }
}, { _id: false });

const coordinatesSchema = new Schema<IVillageCoords>({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  region: { type: String, required: true }
}, { _id: false });

const villageSchema = new Schema<IVillage, IVillageModel>({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  coordinates: { type: coordinatesSchema, required: true },
  buildings: [buildingSchema],
  resources: { type: resourcesSchema, default: () => ({
    gold: 200,
    wood: 200,
    stone: 100,
    iron: 50,
    food: 300,
    lastUpdated: new Date()
  })},
  population: { type: populationSchema, default: () => ({
    current: 10,
    max: 20
  })},
  lastActive: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  description: { 
    type: String,
    maxlength: 500
  },
  avatar: String,
  difficulty: {
    type: String,
    enum: ['easy', 'normal', 'hard'],
    default: 'normal'
  },
  totalBuildingLevels: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Statikus metódusok
villageSchema.statics.findByUserId = async function(
  this: Model<IVillage>,
  userId: string
): Promise<IVillage | null> {
  return this.findOne({ userId }).populate('userId', 'username email role');
};

// Metódus az épület frissítéséhez
villageSchema.methods.updateBuilding = async function(
  this: IVillage,
  buildingId: string, 
  updateData: Partial<IBuilding>
): Promise<IVillage> {
  const building = this.buildings.find((b: { _id?: { toString: () => string } }) => 
    b._id?.toString() === buildingId
  );
  
  if (!building) {
    throw new Error('Épület nem található');
  }
  
  Object.assign(building, updateData);
  
  // Frissítsük az épületszintek összegét
  if (updateData.level !== undefined) {
    this.totalBuildingLevels = this.buildings.reduce(
      (sum, b) => sum + (b.level || 0), 0
    );
  }
  
  return this.save();
};

// Előmentés előtti ellenőrzések
villageSchema.pre<IVillage>('save', function(next) {
  // Frissítsük az utolsó aktív időpontot
  this.lastActive = new Date();
  
  // Ha új falu, állítsuk be az alapértelmezett értékeket
  if (this.isNew) {
    this.totalBuildingLevels = this.buildings.reduce(
      (sum, b) => sum + (b.level || 0), 0
    );
  }
  
  next();
});

// Virtuális mezők
villageSchema.virtual('isCapital').get(function(this: IVillage) {
  return this.difficulty === 'easy';
});

// Model létrehozása
export default mongoose.model<IVillage, IVillageModel>('Village', villageSchema);
