import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export enum SkillType {
  ACTIVE = 'active',
  PASSIVE = 'passive',
  ULTIMATE = 'ultimate',
  AURA = 'aura',
  BUFF = 'buff',
  DEBUFF = 'debuff'
}

export enum SkillCategory {
  COMBAT = 'combat',
  MAGIC = 'magic',
  CRAFTING = 'crafting',
  GATHERING = 'gathering',
  SOCIAL = 'social',
  TRADE = 'trade'
}

export interface ISkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon' | 'teleport' | 'resource';
  target: 'self' | 'enemy' | 'ally' | 'party' | 'all';
  value: number | string; // Szám vagy képlet lehet
  duration?: number; // Másodpercben
  isPercentage?: boolean;
  stat?: string; // Melyik statot érinti (pl. 'strength', 'defense')
  description: string;
}

export interface ISkillRequirement {
  level?: number;
  items?: Array<{
    itemId: Types.ObjectId;
    quantity: number;
    consumed: boolean;
  }>;
  healthPercentage?: number;
  manaPercentage?: number;
  cooldownGroup?: string;
  buffs?: Types.ObjectId[];
  debuffs?: Types.ObjectId[];
}

export interface ISkill extends Document {
  name: string;
  description: string;
  type: SkillType;
  category: SkillCategory;
  icon: string;
  maxLevel: number;
  baseCooldown: number; // Másodpercben
  manaCost: number;
  healthCost: number;
  range: number;
  radius: number;
  castTime: number; // Másodpercben
  isChanneled: boolean;
  channelDuration: number; // Másodpercben
  isToggleable: boolean;
  isPassive: boolean;
  isAura: boolean;
  effects: ISkillEffect[];
  requirements: ISkillRequirement;
  scaling: {
    attribute: 'strength' | 'dexterity' | 'intelligence' | 'constitution' | 'level';
    coefficient: number;
  };
  levelBonuses: Array<{
    level: number;
    description: string;
    effects: Partial<ISkillEffect>;
  }>;
  synergy: Array<{
    skillId: Types.ObjectId;
    bonus: number;
    description: string;
  }>;
  // Verziókövetés és naplózás
  version: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Metódusok
  getEffectAtLevel(level: number): ISkillEffect[];
  getManaCostAtLevel(level: number): number;
  getCooldownAtLevel(level: number): number;
}

interface ISkillModel extends Model<ISkill> {
  findByName(name: string): Promise<ISkill[] | null>;
  findByType(type: SkillType): Promise<ISkill[] | null>;
  findByCategory(category: SkillCategory): Promise<ISkill[] | null>;
}

const skillEffectSchema = new Schema<ISkillEffect>({
  type: {
    type: String,
    required: true,
    enum: ['damage', 'heal', 'buff', 'debuff', 'summon', 'teleport', 'resource']
  },
  target: {
    type: String,
    required: true,
    enum: ['self', 'enemy', 'ally', 'party', 'all']
  },
  value: { type: Schema.Types.Mixed, required: true },
  duration: { type: Number, min: 0 },
  isPercentage: { type: Boolean, default: false },
  stat: { type: String },
  description: { type: String, required: true }
}, { _id: false });

const itemRequirementSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, min: 1 },
  consumed: { type: Boolean, default: true }
}, { _id: false });

const skillRequirementSchema = new Schema<ISkillRequirement>({
  level: { type: Number, min: 1 },
  items: [itemRequirementSchema],
  healthPercentage: { type: Number, min: 0, max: 100 },
  manaPercentage: { type: Number, min: 0, max: 100 },
  cooldownGroup: { type: String },
  buffs: [{ type: Schema.Types.ObjectId, ref: 'Buff' }],
  debuffs: [{ type: Schema.Types.ObjectId, ref: 'Debuff' }]
}, { _id: false });

const scalingSchema = new Schema({
  attribute: {
    type: String,
    required: true,
    enum: ['strength', 'dexterity', 'intelligence', 'constitution', 'level']
  },
  coefficient: { type: Number, required: true, default: 1.0 }
}, { _id: false });

const levelBonusSchema = new Schema({
  level: { type: Number, required: true, min: 1 },
  description: { type: String, required: true },
  effects: { type: Schema.Types.Mixed }
}, { _id: false });

const synergySchema = new Schema({
  skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  bonus: { type: Number, required: true },
  description: { type: String, required: true }
}, { _id: false });

const skillSchema = new Schema<ISkill, ISkillModel>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [50, 'Skill name cannot be longer than 50 characters'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Skill description is required'],
      maxlength: [1000, 'Description cannot be longer than 1000 characters']
    },
    type: {
      type: String,
      required: [true, 'Skill type is required'],
      enum: Object.values(SkillType),
      index: true
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      enum: Object.values(SkillCategory),
      index: true
    },
    icon: {
      type: String,
      required: [true, 'Icon path is required']
    },
    maxLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 1
    },
    baseCooldown: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    manaCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    healthCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    range: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    radius: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    castTime: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    isChanneled: {
      type: Boolean,
      default: false
    },
    channelDuration: {
      type: Number,
      min: 0,
      default: 0
    },
    isToggleable: {
      type: Boolean,
      default: false
    },
    isPassive: {
      type: Boolean,
      default: false
    },
    isAura: {
      type: Boolean,
      default: false
    },
    effects: [skillEffectSchema],
    requirements: {
      type: skillRequirementSchema,
      default: {}
    },
    scaling: {
      type: scalingSchema,
      required: true,
      default: { attribute: 'level', coefficient: 1.0 }
    },
    levelBonuses: [levelBonusSchema],
    synergy: [synergySchema],
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
skillSchema.index({ name: 'text', description: 'text' });
skillSchema.index({ type: 1, category: 1 });

// Statikus metódusok
skillSchema.statics.findByName = async function(name: string): Promise<ISkill[]> {
  return this.find({ name: new RegExp(name, 'i') });
};

skillSchema.statics.findByType = async function(type: SkillType): Promise<ISkill[]> {
  return this.find({ type });
};

skillSchema.statics.findByCategory = async function(category: SkillCategory): Promise<ISkill[]> {
  return this.find({ category });
};

// Példánymetódusok
skillSchema.methods.getEffectAtLevel = function(level: number): ISkillEffect[] {
  if (level < 1) level = 1;
  if (level > this.maxLevel) level = this.maxLevel;
  
  // Alap effektek másolása
  const effects = JSON.parse(JSON.stringify(this.effects));
  
  // Szintbónuszok alkalmazása
  this.levelBonuses
    .filter((bonus: { level: number }) => bonus.level <= level)
    .forEach((bonus: { level: number; effects?: any }) => {
      if (bonus.effects) {
        // Itt lehetne bonyolultabb logika a bónuszok alkalmazására
        effects.push(bonus.effects);
      }
    });
  
  return effects;
};

skillSchema.methods.getManaCostAtLevel = function(level: number): number {
  if (level < 1) level = 1;
  if (level > this.maxLevel) level = this.maxLevel;
  
  // Egyszerű lineáris skálázás a szint alapján
  return Math.floor(this.manaCost * (1 + (level - 1) * 0.1));
};

skillSchema.methods.getCooldownAtLevel = function(level: number): number {
  if (level < 1) level = 1;
  if (level > this.maxLevel) level = this.maxLevel;
  
  // A cooldown csökkenhet a szint növekedésével
  return Math.max(1, Math.floor(this.baseCooldown * (1 - (level - 1) * 0.02)));
};

// Pre-save hook az ellenőrzésekhez
skillSchema.pre('save', function(next) {
  // Ha passzív képesség, akkor nincs cooldown és manaköltség
  if (this.isPassive) {
    this.baseCooldown = 0;
    this.manaCost = 0;
    this.healthCost = 0;
    this.castTime = 0;
    this.isChanneled = false;
    this.isToggleable = false;
  }
  
  // Ha aura, akkor nem lehet channeled
  if (this.isAura) {
    this.isChanneled = false;
  }
  
  next();
});

const Skill = mongoose.model<ISkill, ISkillModel>('Skill', skillSchema);
export default Skill;
