import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPlayer extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    constitution: number;
  };
  inventory: Array<{
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    equipped: boolean;
  }>;
  skills: Array<{
    skillId: mongoose.Types.ObjectId;
    level: number;
  }>;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IPlayerModel extends Model<IPlayer> {
  findByUserId(userId: string): Promise<IPlayer | null>;
}

const playerSchema = new Schema<IPlayer, IPlayerModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Please add a character name'],
      trim: true,
      maxlength: [30, 'Character name cannot be more than 30 characters'],
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 100
    },
    experience: {
      type: Number,
      default: 0,
      min: 0
    },
    health: {
      type: Number,
      default: 100,
      min: 0
    },
    maxHealth: {
      type: Number,
      default: 100,
      min: 1
    },
    attack: {
      type: Number,
      default: 10,
      min: 1
    },
    defense: {
      type: Number,
      default: 5,
      min: 0
    },
    stats: {
      strength: { type: Number, default: 5 },
      dexterity: { type: Number, default: 5 },
      intelligence: { type: Number, default: 5 },
      constitution: { type: Number, default: 5 }
    },
    inventory: [{
      itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
      quantity: { type: Number, default: 1, min: 1 },
      equipped: { type: Boolean, default: false }
    }],
    skills: [{
      skillId: { type: Schema.Types.ObjectId, ref: 'Skill' },
      level: { type: Number, default: 1, min: 1, max: 100 }
    }],
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Statikus metódus a felhasználó ID alapján történő kereséshez
playerSchema.statics.findByUserId = async function(userId: string): Promise<IPlayer | null> {
  return this.findOne({ userId }).populate('inventory.itemId skills.skillId');
};

// Életpontok frissítése
playerSchema.methods.updateHealth = function(amount: number): void {
  this.health = Math.min(Math.max(0, this.health + amount), this.maxHealth);
};

// Tapasztalati pont hozzáadása és szintlépés kezelése
playerSchema.methods.addExperience = function(amount: number): { leveledUp: boolean; newLevel?: number } {
  if (amount <= 0) return { leveledUp: false };
  
  this.experience += amount;
  const oldLevel = this.level;
  const expForNextLevel = this.calculateExpForNextLevel();
  
  if (this.experience >= expForNextLevel) {
    this.level++;
    this.maxHealth += 10;
    this.health = this.maxHealth; // Teljes életerő feltöltése szintlépéskor
    this.attack += 2;
    this.defense += 1;
    this.experience -= expForNextLevel;
    
    // Stat növekmény szintlépéskor
    this.stats.strength += 1;
    this.stats.constitution += 1;
    
    return { leveledUp: true, newLevel: this.level };
  }
  
  return { leveledUp: false };
};

// Következő szinthez szükséges tapasztalati pontok kiszámítása
playerSchema.methods.calculateExpForNextLevel = function(): number {
  return Math.floor(100 * Math.pow(1.1, this.level - 1));
};

const Player = mongoose.model<IPlayer, IPlayerModel>('Player', playerSchema);
export default Player;
