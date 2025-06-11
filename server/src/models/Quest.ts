import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export enum QuestType {
  KILL = 'kill',
  COLLECT = 'collect',
  EXPLORE = 'explore',
  TALK = 'talk',
  ESCORT = 'escort',
  DELIVERY = 'delivery',
  DISCOVERY = 'discovery',
  CRAFTING = 'crafting',
  REPUTATION = 'reputation'
}

export enum QuestRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum QuestStatus {
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ABANDONED = 'abandoned'
}

export interface IQuestRequirement {
  minLevel?: number;
  maxLevel?: number;
  quests?: Types.ObjectId[];
  items?: Array<{
    itemId: Types.ObjectId;
    quantity: number;
  }>;
  skills?: Types.ObjectId[];
  reputation?: Array<{
    factionId: Types.ObjectId;
    minReputation: number;
  }>;
  timeLimit?: number; // Másodpercben
}

export interface IQuestReward {
  experience: number;
  gold: number;
  items?: Array<{
    itemId: Types.ObjectId;
    quantity: number;
    chance: number; // 0-1 közötti érték
  }>;
  skills?: Array<{
    skillId: Types.ObjectId;
    level: number;
  }>;
  reputation?: Array<{
    factionId: Types.ObjectId;
    amount: number;
  }>;
  unlockQuests?: Types.ObjectId[];
  unlockAreas?: Types.ObjectId[];
}

export interface IQuestObjective {
  type: 'kill' | 'collect' | 'explore' | 'talk' | 'use' | 'reach' | 'discover' | 'craft' | 'gather';
  targetId: Types.ObjectId | string;
  targetName: string;
  description: string;
  requiredAmount: number;
  currentAmount: number;
  isHidden: boolean;
  isOptional: boolean;
  order: number;
  data?: Record<string, any>; // További dinamikus adatok
}

export interface IQuest extends Document {
  title: string;
  description: string;
  type: QuestType;
  rarity: QuestRarity;
  minLevel: number;
  maxLevel: number;
  isRepeatable: boolean;
  cooldown: number; // Másodpercben
  requirements: IQuestRequirement;
  rewards: IQuestReward;
  objectives: IQuestObjective[];
  giver: {
    type: 'npc' | 'object' | 'item' | 'area';
    id: Types.ObjectId;
    name: string;
  };
  turnIn: {
    type: 'npc' | 'object' | 'area';
    id: Types.ObjectId;
    name: string;
  };
  zone: {
    id: Types.ObjectId;
    name: string;
  };
  isMainStory: boolean;
  isDaily: boolean;
  isWeekly: boolean;
  isEvent: boolean;
  eventId?: Types.ObjectId;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IQuestModel extends Model<IQuest> {
  findAvailableForPlayer(playerId: Types.ObjectId, playerLevel: number): Promise<IQuest[]>;
  findByZone(zoneId: Types.ObjectId): Promise<IQuest[]>;
  findByType(type: QuestType): Promise<IQuest[]>;
}

const questRequirementSchema = new Schema<IQuestRequirement>({
  minLevel: { type: Number, min: 1, default: 1 },
  maxLevel: { type: Number, min: 1, max: 100 },
  quests: [{ type: Schema.Types.ObjectId, ref: 'Quest' }],
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
  reputation: [{
    factionId: { type: Schema.Types.ObjectId, ref: 'Faction', required: true },
    minReputation: { type: Number, required: true }
  }],
  timeLimit: { type: Number, min: 0 }
}, { _id: false });

const questRewardSchema = new Schema<IQuestReward>({
  experience: { type: Number, required: true, min: 0, default: 0 },
  gold: { type: Number, required: true, min: 0, default: 0 },
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true, min: 1 },
    chance: { type: Number, required: true, min: 0, max: 1, default: 1 }
  }],
  skills: [{
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    level: { type: Number, required: true, min: 1, max: 100 }
  }],
  reputation: [{
    factionId: { type: Schema.Types.ObjectId, ref: 'Faction', required: true },
    amount: { type: Number, required: true }
  }],
  unlockQuests: [{ type: Schema.Types.ObjectId, ref: 'Quest' }],
  unlockAreas: [{ type: Schema.Types.ObjectId, ref: 'Zone' }]
}, { _id: false });

const questObjectiveSchema = new Schema<IQuestObjective>({
  type: {
    type: String,
    required: true,
    enum: ['kill', 'collect', 'explore', 'talk', 'use', 'reach', 'discover', 'craft', 'gather']
  },
  targetId: { type: Schema.Types.Mixed, required: true },
  targetName: { type: String, required: true },
  description: { type: String, required: true },
  requiredAmount: { type: Number, required: true, min: 1, default: 1 },
  currentAmount: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false },
  isOptional: { type: Boolean, default: false },
  order: { type: Number, required: true, min: 0 },
  data: { type: Schema.Types.Mixed }
}, { _id: false });

const questGiverSchema = new Schema({
  type: { type: String, required: true, enum: ['npc', 'object', 'item', 'area'] },
  id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true }
}, { _id: false });

const zoneReferenceSchema = new Schema({
  id: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true }
}, { _id: false });

const questSchema = new Schema<IQuest, IQuestModel>(
  {
    title: {
      type: String,
      required: [true, 'Quest title is required'],
      trim: true,
      maxlength: [100, 'Quest title cannot be longer than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Quest description is required'],
      maxlength: [5000, 'Description cannot be longer than 5000 characters']
    },
    type: {
      type: String,
      required: [true, 'Quest type is required'],
      enum: Object.values(QuestType),
      index: true
    },
    rarity: {
      type: String,
      required: [true, 'Quest rarity is required'],
      enum: Object.values(QuestRarity),
      default: QuestRarity.COMMON
    },
    minLevel: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    maxLevel: {
      type: Number,
      min: 1,
      max: 100
    },
    isRepeatable: {
      type: Boolean,
      default: false
    },
    cooldown: {
      type: Number,
      min: 0,
      default: 0
    },
    requirements: {
      type: questRequirementSchema,
      default: {}
    },
    rewards: {
      type: questRewardSchema,
      required: true
    },
    objectives: {
      type: [questObjectiveSchema],
      required: true,
      validate: {
        validator: function(v: any[]) {
          return v.length > 0;
        },
        message: 'At least one objective is required'
      }
    },
    giver: {
      type: questGiverSchema,
      required: true
    },
    turnIn: {
      type: questGiverSchema,
      required: true
    },
    zone: {
      type: zoneReferenceSchema,
      required: true
    },
    isMainStory: {
      type: Boolean,
      default: false
    },
    isDaily: {
      type: Boolean,
      default: false
    },
    isWeekly: {
      type: Boolean,
      default: false
    },
    isEvent: {
      type: Boolean,
      default: false
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event'
    },
    version: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexek a gyorsabb kereséshez
questSchema.index({ title: 'text', description: 'text' });
questSchema.index({ type: 1, rarity: 1 });
questSchema.index({ 'giver.id': 1, 'giver.type': 1 });
questSchema.index({ 'turnIn.id': 1, 'turnIn.type': 1 });
questSchema.index({ 'zone.id': 1 });
questSchema.index({ isMainStory: 1 });
questSchema.index({ isDaily: 1 });
questSchema.index({ isWeekly: 1 });
questSchema.index({ isEvent: 1, eventId: 1 });

// Statikus metódusok
questSchema.statics.findAvailableForPlayer = async function(
  playerId: Types.ObjectId,
  playerLevel: number
): Promise<IQuest[]> {
  return this.find({
    'requirements.minLevel': { $lte: playerLevel },
    $or: [
      { 'requirements.maxLevel': { $exists: false } },
      { 'requirements.maxLevel': { $gte: playerLevel } }
    ]
    // TODO: További ellenőrzések (előző küldetések, tárgyak stb.)
  }).sort({ isMainStory: -1, minLevel: 1 });
};

questSchema.statics.findByZone = async function(zoneId: Types.ObjectId): Promise<IQuest[]> {
  return this.find({ 'zone.id': zoneId });
};

questSchema.statics.findByType = async function(type: QuestType): Promise<IQuest[]> {
  return this.find({ type });
};

// Virtuális mezők
questSchema.virtual('isAvailable').get(function() {
  return this.status === QuestStatus.AVAILABLE;
});

questSchema.virtual('isInProgress').get(function() {
  return this.status === QuestStatus.IN_PROGRESS;
});

questSchema.virtual('isCompleted').get(function() {
  return this.status === QuestStatus.COMPLETED;
});

// Pre-save hook az ellenőrzésekhez
questSchema.pre('save', function(next) {
  // Ha nincs megadva maxLevel, akkor állítsuk be a minLevel értékére
  if (!this.maxLevel) {
    this.maxLevel = this.minLevel;
  }
  
  // Ha napi vagy heti küldetés, akkor ismételhető
  if (this.isDaily || this.isWeekly) {
    this.isRepeatable = true;
  }
  
  // Ha esemény küldetés, akkor kötelező az eventId
  if (this.isEvent && !this.eventId) {
    throw new Error('Event quest must have an eventId');
  }
  
  next();
});

const Quest = mongoose.model<IQuest, IQuestModel>('Quest', questSchema);
export default Quest;
