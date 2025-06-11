import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { QuestStatus } from './Quest';

export interface IPlayerQuestObjective {
  objectiveId: Types.ObjectId;
  currentAmount: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface IPlayerQuest extends Document {
  playerId: Types.ObjectId;
  questId: Types.ObjectId;
  status: QuestStatus;
  objectives: IPlayerQuestObjective[];
  progress: number; // 0-100 közötti érték
  isTracked: boolean;
  acceptedAt: Date;
  completedAt?: Date;
  abandonedAt?: Date;
  expiresAt?: Date;
  data?: Record<string, any>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Metódusok
  updateObjective(objectiveId: Types.ObjectId, amount: number): Promise<boolean>;
  completeObjective(objectiveId: Types.ObjectId): Promise<boolean>;
  checkCompletion(): Promise<boolean>;
  abandon(): Promise<void>;
}

interface IPlayerQuestModel extends Model<IPlayerQuest> {
  findByPlayer(playerId: Types.ObjectId, status?: QuestStatus): Promise<IPlayerQuest[]>;
  findByPlayerAndQuest(playerId: Types.ObjectId, questId: Types.ObjectId): Promise<IPlayerQuest | null>;
  getActiveQuests(playerId: Types.ObjectId): Promise<IPlayerQuest[]>;
  getCompletedQuests(playerId: Types.ObjectId): Promise<IPlayerQuest[]>;
}

const playerQuestObjectiveSchema = new Schema<IPlayerQuestObjective>({
  objectiveId: { type: Schema.Types.ObjectId, required: true },
  currentAmount: { type: Number, required: true, min: 0, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { _id: false });

const playerQuestSchema = new Schema<IPlayerQuest, IPlayerQuestModel>(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
      index: true
    },
    questId: {
      type: Schema.Types.ObjectId,
      ref: 'Quest',
      required: true,
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(QuestStatus),
      default: QuestStatus.IN_PROGRESS,
      index: true
    },
    objectives: [playerQuestObjectiveSchema],
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0
    },
    isTracked: {
      type: Boolean,
      default: false
    },
    acceptedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    abandonedAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    },
    data: {
      type: Schema.Types.Mixed
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

// Egyedi index, hogy egy játékos csak egyszer kapja meg ugyanazt a küldetést (kivéve ha ismételhető)
playerQuestSchema.index(
  { playerId: 1, questId: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: QuestStatus.ABANDONED } } }
);

// Statikus metódusok
playerQuestSchema.statics.findByPlayer = async function(
  playerId: Types.ObjectId,
  status?: QuestStatus
): Promise<IPlayerQuest[]> {
  const query: any = { playerId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('questId');
};

playerQuestSchema.statics.findByPlayerAndQuest = async function(
  playerId: Types.ObjectId,
  questId: Types.ObjectId
): Promise<IPlayerQuest | null> {
  return this.findOne({ playerId, questId }).populate('questId');
};

playerQuestSchema.statics.getActiveQuests = async function(
  playerId: Types.ObjectId
): Promise<IPlayerQuest[]> {
  return this.find({
    playerId,
    status: QuestStatus.IN_PROGRESS
  }).populate('questId');
};

playerQuestSchema.statics.getCompletedQuests = async function(
  playerId: Types.ObjectId
): Promise<IPlayerQuest[]> {
  return this.find({
    playerId,
    status: QuestStatus.COMPLETED
  }).populate('questId');
};

// Példánymetódusok
playerQuestSchema.methods.updateObjective = async function(
  objectiveId: Types.ObjectId,
  amount: number
): Promise<boolean> {
  if (this.status !== QuestStatus.IN_PROGRESS) {
    return false;
  }

  const objective = this.objectives.find(
    (obj: any) => obj.objectiveId.equals(objectiveId)
  );

  if (!objective || objective.isCompleted) {
    return false;
  }

  objective.currentAmount = Math.max(0, amount);
  
  // Frissítsük a teljesítési százalékot
  await this.checkCompletion();
  
  return true;
};

playerQuestSchema.methods.completeObjective = async function(
  objectiveId: Types.ObjectId
): Promise<boolean> {
  if (this.status !== QuestStatus.IN_PROGRESS) {
    return false;
  }

  const objective = this.objectives.find(
    (obj: any) => obj.objectiveId.equals(objectiveId)
  );

  if (!objective || objective.isCompleted) {
    return false;
  }

  objective.isCompleted = true;
  objective.completedAt = new Date();
  
  // Ellenőrizzük, hogy minden cél teljesült-e
  await this.checkCompletion();
  
  return true;
};

playerQuestSchema.methods.checkCompletion = async function(): Promise<boolean> {
  if (this.status !== QuestStatus.IN_PROGRESS) {
    return false;
  }

  const totalObjectives = this.objectives.length;
  const completedObjectives = this.objectives.filter(
    (obj: any) => obj.isCompleted
  ).length;

  // Számítsuk ki a teljesítési százalékot
  this.progress = Math.round((completedObjectives / totalObjectives) * 100);

  // Ha minden cél teljesült, állítsuk be a küldetést befejezettként
  if (completedObjectives === totalObjectives) {
    this.status = QuestStatus.COMPLETED;
    this.completedAt = new Date();
    await this.save();
    return true;
  }

  await this.save();
  return false;
};

playerQuestSchema.methods.abandon = async function(): Promise<void> {
  if (this.status !== QuestStatus.IN_PROGRESS) {
    throw new Error('Only in-progress quests can be abandoned');
  }

  this.status = QuestStatus.ABANDONED;
  this.abandonedAt = new Date();
  await this.save();
};

// Pre-save hook az ellenőrzésekhez
playerQuestSchema.pre('save', function(next) {
  // Ha a küldetés befejeződött, de nincs beállítva a completedAt
  if (this.status === QuestStatus.COMPLETED && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Ha a küldetés elhagyott státuszba került, de nincs beállítva az abandonedAt
  if (this.status === QuestStatus.ABANDONED && !this.abandonedAt) {
    this.abandonedAt = new Date();
  }
  
  next();
});

const PlayerQuest = mongoose.model<IPlayerQuest, IPlayerQuestModel>('PlayerQuest', playerQuestSchema);
export default PlayerQuest;
