import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  QUEST = 'quest',
  TREASURE = 'treasure'
}

export interface IItemEffect {
  stat: 'health' | 'mana' | 'stamina' | 'strength' | 'dexterity' | 'intelligence' | 'constitution';
  value: number;
  duration?: number; // másodpercben, ha van időtartama
  isPercentage?: boolean;
}

export interface IItem extends Document {
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  weight: number;
  icon: string;
  stackable: boolean;
  maxStack: number;
  effects: IItemEffect[];
  requirements: {
    level: number;
    strength?: number;
    dexterity?: number;
    intelligence?: number;
    constitution?: number;
  };
  // Fegyver specifikus mezők
  damage?: {
    min: number;
    max: number;
    type: 'physical' | 'magical' | 'fire' | 'ice' | 'lightning' | 'poison';
  };
  // Páncél specifikus mezők
  armor?: {
    defense: number;
    type: 'light' | 'medium' | 'heavy';
    slot: 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'shoulders' | 'waist';
  };
  // Fogyasztható tárgyakhoz
  consumable?: {
    cooldown: number; // másodpercben
    onUse: IItemEffect[];
  };
  // Képesítő tárgyakhoz
  skillModifiers?: {
    skillId: Types.ObjectId;
    bonus: number;
  }[];
  // Egyedi tulajdonságok
  isUnique: boolean;
  isSoulbound: boolean;
  isTradable: boolean;
  // Képzési recept és kereskedelmi információk
  recipe?: {
    ingredients: Array<{
      itemId: Types.ObjectId;
      quantity: number;
    }>;
    skillRequired: string;
    skillLevel: number;
    time: number; // másodpercben
  };
  // Verziókövetés és naplózás
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IItemModel extends Model<IItem> {
  findByName(name: string): Promise<IItem[] | null>;
  findByType(type: ItemType): Promise<IItem[] | null>;
  findByRarity(rarity: ItemRarity): Promise<IItem[] | null>;
}

const itemEffectSchema = new Schema<IItemEffect>({
  stat: {
    type: String,
    required: true,
    enum: ['health', 'mana', 'stamina', 'strength', 'dexterity', 'intelligence', 'constitution']
  },
  value: { type: Number, required: true },
  duration: { type: Number },
  isPercentage: { type: Boolean, default: false }
}, { _id: false });

const damageSchema = new Schema({
  min: { type: Number, required: true, min: 0 },
  max: { type: Number, required: true, min: 0 },
  type: {
    type: String,
    required: true,
    enum: ['physical', 'magical', 'fire', 'ice', 'lightning', 'poison']
  }
}, { _id: false });

const armorSchema = new Schema({
  defense: { type: Number, required: true, min: 0 },
  type: {
    type: String,
    required: true,
    enum: ['light', 'medium', 'heavy']
  },
  slot: {
    type: String,
    required: true,
    enum: ['head', 'chest', 'legs', 'feet', 'hands', 'shoulders', 'waist']
  }
}, { _id: false });

const consumableSchema = new Schema({
  cooldown: { type: Number, required: true, min: 0 },
  onUse: [itemEffectSchema]
}, { _id: false });

const skillModifierSchema = new Schema({
  skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  bonus: { type: Number, required: true }
}, { _id: false });

const recipeIngredientSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const recipeSchema = new Schema({
  ingredients: [recipeIngredientSchema],
  skillRequired: { type: String, required: true },
  skillLevel: { type: Number, required: true, min: 1 },
  time: { type: Number, required: true, min: 0 }
}, { _id: false });

const requirementsSchema = new Schema({
  level: { type: Number, default: 1, min: 1 },
  strength: { type: Number, min: 0 },
  dexterity: { type: Number, min: 0 },
  intelligence: { type: Number, min: 0 },
  constitution: { type: Number, min: 0 }
}, { _id: false });

const itemSchema = new Schema<IItem, IItemModel>(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [50, 'Item name cannot be longer than 50 characters'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
      maxlength: [1000, 'Description cannot be longer than 1000 characters']
    },
    type: {
      type: String,
      required: [true, 'Item type is required'],
      enum: Object.values(ItemType),
      index: true
    },
    rarity: {
      type: String,
      required: [true, 'Item rarity is required'],
      enum: Object.values(ItemRarity),
      default: ItemRarity.COMMON,
      index: true
    },
    value: {
      type: Number,
      required: [true, 'Item value is required'],
      min: 0,
      default: 0
    },
    weight: {
      type: Number,
      required: [true, 'Item weight is required'],
      min: 0,
      default: 0
    },
    icon: {
      type: String,
      required: [true, 'Icon path is required']
    },
    stackable: {
      type: Boolean,
      default: false
    },
    maxStack: {
      type: Number,
      default: 1,
      min: 1,
      max: 10000
    },
    effects: [itemEffectSchema],
    requirements: {
      type: requirementsSchema,
      default: { level: 1 }
    },
    damage: damageSchema,
    armor: armorSchema,
    consumable: consumableSchema,
    skillModifiers: [skillModifierSchema],
    isUnique: {
      type: Boolean,
      default: false
    },
    isSoulbound: {
      type: Boolean,
      default: false
    },
    isTradable: {
      type: Boolean,
      default: true
    },
    recipe: recipeSchema,
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

// Indexek a gyakori keresésekhez
itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ type: 1, rarity: 1 });

// Statikus metódusok
itemSchema.statics.findByName = async function(name: string): Promise<IItem[]> {
  return this.find({ name: new RegExp(name, 'i') });
};

itemSchema.statics.findByType = async function(type: ItemType): Promise<IItem[]> {
  return this.find({ type });
};

itemSchema.statics.findByRarity = async function(rarity: ItemRarity): Promise<IItem[]> {
  return this.find({ rarity });
};

// Virtuális mező az érték kategóriákhoz
itemSchema.virtual('valueCategory').get(function(this: IItem) {
  if (this.value < 10) return 'trash';
  if (this.value < 100) return 'common';
  if (this.value < 1000) return 'uncommon';
  if (this.value < 10000) return 'rare';
  return 'epic';
});

// Pre-save hook az egyedi tárgyak ellenőrzéséhez
itemSchema.pre('save', function(next) {
  if (this.isUnique) {
    this.isTradable = false;
    this.isSoulbound = true;
  }
  next();
});

const Item = mongoose.model<IItem, IItemModel>('Item', itemSchema);
export default Item;
