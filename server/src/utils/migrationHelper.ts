import mongoose, { Connection } from 'mongoose';
import { User, Player, Village, Item, Skill, Quest, PlayerQuest } from '../models';
import chalk from 'chalk';

type MigrationFunction = () => Promise<void>;

interface MigrationLog {
  name: string;
  startedAt: Date;
  finishedAt?: Date;
  success?: boolean;
  error?: string;
  duration?: number;
}

class MigrationHelper {
  private connection: mongoose.Connection;
  private migrations: { name: string; fn: MigrationFunction }[] = [];
  private migrationLog: MigrationLog[] = [];
  private startTime: Date;

  constructor(connection: mongoose.Connection) {
    this.connection = connection;
    this.startTime = new Date();
    this.registerMigrations();
  }

  private registerMigrations(): void {
    this.addMigration('Base Data', this.migrateBaseData.bind(this));
    this.addMigration('Users', this.migrateUsers.bind(this));
    this.addMigration('Players', this.migratePlayers.bind(this));
    this.addMigration('Villages', this.migrateVillages.bind(this));
    this.addMigration('Items', this.migrateItems.bind(this));
    this.addMigration('Skills', this.migrateSkills.bind(this));
    this.addMigration('Quests', this.migrateQuests.bind(this));
  }

  private addMigration(name: string, fn: MigrationFunction): void {
    this.migrations.push({ name, fn });
  }

  public async runMigrations(): Promise<void> {
    const startTime = new Date();
    this.log('info', `Starting database migrations at ${startTime.toISOString()}`);
    
    try {
      for (const migration of this.migrations) {
        await this.runMigration(migration);
      }
      
      const endTime = new Date();
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;
      
      this.log('success', `✅ All migrations completed successfully in ${duration.toFixed(2)}s`);
      this.printMigrationSummary();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.log('error', `❌ Migration failed: ${errorMessage}`);
      this.printMigrationSummary();
      throw error;
    }
  }

  private async runMigration(migration: { name: string; fn: MigrationFunction }): Promise<void> {
    const logEntry: MigrationLog = {
      name: migration.name,
      startedAt: new Date(),
    };
    
    this.migrationLog.push(logEntry);
    this.log('info', `Running migration: ${migration.name}`);
    
    try {
      await migration.fn();
      logEntry.finishedAt = new Date();
      logEntry.success = true;
      logEntry.duration = logEntry.finishedAt.getTime() - logEntry.startedAt.getTime();
      
      this.log('success', `✅ ${migration.name} completed in ${logEntry.duration}ms`);
    } catch (error) {
      logEntry.finishedAt = new Date();
      logEntry.success = false;
      logEntry.error = error instanceof Error ? error.message : 'Unknown error';
      logEntry.duration = logEntry.finishedAt.getTime() - logEntry.startedAt.getTime();
      
      this.log('error', `❌ ${migration.name} failed after ${logEntry.duration}ms: ${logEntry.error}`);
      throw error;
    }
  }

  private printMigrationSummary(): void {
    this.log('info', '\n=== Migration Summary ===');
    
    const successCount = this.migrationLog.filter(m => m.success).length;
    const failedCount = this.migrationLog.length - successCount;
    
    this.log('info', `Total migrations: ${this.migrationLog.length}`);
    this.log('success', `✅ Success: ${successCount}`);
    
    if (failedCount > 0) {
      this.log('error', `❌ Failed: ${failedCount}`);
    }
    
    // Részletes naplók
    this.log('info', '\nDetailed Logs:');
    this.migrationLog.forEach((log, index) => {
      const status = log.success ? '✅' : '❌';
      const duration = log.duration ? `(${log.duration}ms)` : '';
      const error = log.error ? `: ${log.error}` : '';
      this.log('info', `${index + 1}. ${status} ${log.name} ${duration}${error}`);
    });
  }

  private log(level: 'info' | 'success' | 'error' | 'warning' | 'debug', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      error: chalk.red,
      warning: chalk.yellow,
      debug: chalk.gray,
    };
    
    const color = colors[level] || ((s: string) => s);
    const prefix = `[${timestamp}] ${color(`[${level.toUpperCase()}]`.padEnd(8))}`;
    
    // Log the main message
    console.log(`${prefix} ${message}`);
    
    // Log additional data if provided
    if (data !== undefined && process.env.DEBUG) {
      if (typeof data === 'object') {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(data);
      }
    }
  }

  // Migration methods
  private async migrateBaseData(): Promise<void> {
    this.log('info', 'Migrating base data...');
    // Add base data migration logic here
  }

  public async migrateUsers(): Promise<void> {
    this.log('info', 'Migrating users...');
    
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await require('bcryptjs').hash('admin123', 10);
      const adminUser = new User({
        username: 'admin',
        email: 'admin@rpg-game.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        lastLogin: new Date(),
        settings: { theme: 'dark', language: 'hu', notifications: { email: true, push: true } }
      });
      await adminUser.save();
      this.log('success', '✅ Default admin user created successfully');
    } else {
      this.log('info', `Found ${userCount} users, no migration needed`);
    }
  }

  private async migratePlayers(): Promise<void> {
    this.log('info', 'Migrating players...');
    
    const users = await User.find({});
    let createdCount = 0;
    
    for (const user of users) {
      try {
        const existingPlayer = await Player.findOne({ userId: user._id });
        
        if (!existingPlayer) {
          const newPlayer = new Player({
            userId: user._id,
            name: user.username,
            level: 1,
            experience: 0,
            health: 100,
            maxHealth: 100,
            attack: 10,
            defense: 5,
            stats: {
              strength: 5,
              dexterity: 5,
              intelligence: 5,
              constitution: 5
            },
            inventory: [],
            skills: [],
            lastActive: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await newPlayer.save();
          createdCount++;
          this.log('debug', `Created player for user: ${user.username}`);
        }
      } catch (error) {
        this.log('error', `Failed to create player for user ${user.username}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    if (createdCount > 0) {
      this.log('success', `Successfully created ${createdCount} player(s)`);
    } else {
      this.log('info', 'No new players were created');
    }
  }

  private async migrateVillages(): Promise<void> {
    this.log('info', 'Migrating villages...');
    
    const villageCount = await Village.countDocuments();
    if (villageCount > 0) {
      this.log('info', `Found ${villageCount} villages, skipping village migration`);
      return;
    }
    
    const players = await Player.find({}).populate('userId');
    
    if (players.length === 0) {
      this.log('warning', 'No players found, skipping village migration');
      return;
    }
    
    let createdCount = 0;
    
    for (const player of players) {
      try {
        const existingVillage = await Village.findOne({ userId: player.userId });
        
        if (!existingVillage) {
          const newVillage = new Village({
            name: `${player.name}'s Village`,
            userId: player._id,
            coordinates: {
              x: Math.floor(Math.random() * 1000) - 500,
              y: Math.floor(Math.random() * 1000) - 500,
              region: 'starter'
            },
            buildings: [
              {
                type: 'townhall',
                level: 1,
                position: { x: 4, y: 4 },
                lastUpgraded: new Date(),
                isUnderConstruction: false,
                _id: new mongoose.Types.ObjectId()
              },
              {
                type: 'farm',
                level: 1,
                position: { x: 2, y: 4 },
                lastUpgraded: new Date(),
                isUnderConstruction: false,
                _id: new mongoose.Types.ObjectId()
              },
              {
                type: 'lumbermill',
                level: 1,
                position: { x: 6, y: 4 },
                lastUpgraded: new Date(),
                isUnderConstruction: false,
                _id: new mongoose.Types.ObjectId()
              }
            ],
            resources: {
              gold: 1000,
              wood: 500,
              stone: 500,
              iron: 200,
              food: 1000,
              lastUpdated: new Date()
            },
            population: {
              current: 5,
              max: 10
            },
            lastActive: new Date(),
            isActive: true,
            description: 'Your starting village in the world.',
            difficulty: 'normal',
            totalBuildingLevels: 3,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await newVillage.save();
          createdCount++;
          this.log('debug', `Created village for player: ${player.name}`);
        }
      } catch (error) {
        this.log('error', `Failed to create village for player ${player.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    if (createdCount > 0) {
      this.log('success', `Successfully created ${createdCount} village(s)`);
    } else {
      this.log('info', 'No new villages were created');
    }
  }

  private async migrateItems(): Promise<void> {
    this.log('info', 'Migrating items...');
    
    const itemCount = await Item.countDocuments();
    if (itemCount > 0) {
      this.log('info', `Found ${itemCount} items, skipping item migration`);
      return;
    }
    
    const defaultItems = [
      {
        name: 'Bronze Sword',
        description: 'Basic sword made of bronze. Better than nothing.',
        type: 'weapon',
        rarity: 'common',
        value: 50,
        weight: 2.5,
        icon: 'sword_bronze',
        stackable: false,
        maxStack: 1,
        effects: [],
        requirements: { level: 1 },
        weapon: {
          type: 'sword',
          damage: { min: 5, max: 10 },
          attackSpeed: 1.5,
          range: 1.5
        },
        isUnique: false,
        isSoulbound: false,
        isTradable: true,
        version: 1
      },
      {
        name: 'Leather Armor',
        description: 'Basic armor made of leather. Provides minimal protection.',
        type: 'armor',
        rarity: 'common',
        value: 75,
        weight: 5,
        icon: 'armor_leather',
        stackable: false,
        maxStack: 1,
        effects: [],
        requirements: { level: 1 },
        armor: {
          type: 'chest',
          defense: 5,
          resistance: {
            physical: 3,
            magic: 1
          }
        },
        isUnique: false,
        isSoulbound: false,
        isTradable: true,
        version: 1
      },
      {
        name: 'Health Potion',
        description: 'Restores 50 health when consumed.',
        type: 'consumable',
        rarity: 'common',
        value: 25,
        weight: 0.5,
        icon: 'potion_health',
        stackable: true,
        maxStack: 20,
        effects: [
          {
            type: 'heal',
            target: 'self',
            value: 50,
            description: 'Restores 50 health'
          }
        ],
        requirements: { level: 1 },
        consumable: {
          cooldown: 30,
          onUse: [
            {
              type: 'heal',
              target: 'self',
              value: 50,
              description: 'Restores 50 health'
            }
          ]
        },
        isUnique: false,
        isSoulbound: false,
        isTradable: true,
        version: 1
      },
      {
        name: 'Ancient Coin',
        description: 'An ancient coin of unknown origin. It might be valuable to collectors.',
        type: 'treasure',
        rarity: 'uncommon',
        value: 100,
        weight: 0.1,
        icon: 'treasure_coin',
        stackable: true,
        maxStack: 100,
        effects: [],
        requirements: {},
        isUnique: false,
        isSoulbound: false,
        isTradable: true,
        version: 1
      }
    ];
    
    try {
      const result = await Item.insertMany(defaultItems, { ordered: false });
      this.log('success', `✅ Successfully created ${result.length} items`);
    } catch (error) {
      if ((error as any).code === 11000) {
        this.log('info', 'Items already exist, skipping item migration');
      } else {
        throw error;
      }
    }
  }

  private async migrateSkills(): Promise<void> {
    this.log('info', 'Migrating skills...');
    
    const skillCount = await Skill.countDocuments();
    if (skillCount > 0) {
      this.log('info', `Found ${skillCount} skills, skipping skill migration`);
      return;
    }
    
    const defaultSkills = [
      {
        name: 'Power Strike',
        description: 'A powerful strike that deals extra damage.',
        type: 'active',
        category: 'combat',
        icon: 'skill_power_strike',
        level: 1,
        maxLevel: 5,
        cooldown: 10,
        manaCost: 15,
        requirements: { level: 1 },
        effects: [
          {
            type: 'damage',
            target: 'enemy',
            value: 15,
            scaling: { strength: 1.2 }
          }
        ],
        levelBonuses: [
          { level: 2, effect: { value: 20 } },
          { level: 3, effect: { value: 25 } },
          { level: 4, effect: { value: 30 } },
          { level: 5, effect: { value: 35 } }
        ],
        isPassive: false,
        isAura: false,
        isToggle: false,
        isUltimate: false,
        isStance: false,
        isHidden: false,
        version: 1
      },
      {
        name: 'First Aid',
        description: 'Heals yourself for a small amount of health.',
        type: 'active',
        category: 'survival',
        icon: 'skill_first_aid',
        level: 1,
        maxLevel: 3,
        cooldown: 30,
        manaCost: 20,
        requirements: { level: 2 },
        effects: [
          {
            type: 'heal',
            target: 'self',
            value: 30,
            scaling: { intelligence: 0.8 }
          }
        ],
        levelBonuses: [
          { level: 2, effect: { value: 45 } },
          { level: 3, effect: { value: 60 } }
        ],
        isPassive: false,
        isAura: false,
        isToggle: false,
        isUltimate: false,
        isStance: false,
        isHidden: false,
        version: 1
      }
    ];
    
    try {
      const result = await Skill.insertMany(defaultSkills, { ordered: false });
      this.log('success', `✅ Successfully created ${result.length} skills`);
    } catch (error) {
      if ((error as any).code === 11000) {
        this.log('info', 'Skills already exist, skipping skill migration');
      } else {
        throw error;
      }
    }
  }

  private async migrateQuests(): Promise<void> {
    this.log('info', 'Migrating quests...');
    
    const questCount = await Quest.countDocuments();
    if (questCount > 0) {
      this.log('info', `Found ${questCount} quests, skipping quest migration`);
      return;
    }
    
    // Get required items and skills for quest rewards
    const [items, skills] = await Promise.all([
      Item.find({}),
      Skill.find({})
    ]);
    
    if (items.length === 0 || skills.length === 0) {
      this.log('warning', 'Items or skills not found, please run item and skill migrations first');
      return;
    }
    
    const rewardItem = items.find(item => item.name === 'Health Potion');
    const rewardSkill = skills.find(skill => skill.name === 'Power Strike');
    
    if (!rewardItem || !rewardSkill) {
      this.log('error', 'Required items or skills not found for quest rewards');
      return;
    }
    
    const defaultQuests = [
      {
        title: 'First Steps',
        description: 'Complete your first quest and learn the basics of the game.',
        type: 'main',
        status: 'active',
        requirements: {
          level: 1,
          quests: [],
          items: []
        },
        objectives: [
          {
            type: 'talk',
            target: 'village_elder',
            targetName: 'Village Elder',
            description: 'Talk to the Village Elder',
            requiredCount: 1,
            currentCount: 0,
            isCompleted: false
          },
          {
            type: 'kill',
            target: 'wild_boar',
            targetName: 'Wild Boar',
            description: 'Defeat 3 Wild Boars',
            requiredCount: 3,
            currentCount: 0,
            isCompleted: false
          }
        ],
        rewards: {
          experience: 100,
          gold: 50,
          items: [
            {
              itemId: rewardItem._id,
              quantity: 3
            }
          ],
          skills: [rewardSkill._id]
        },
        giver: {
          type: 'npc',
          npcId: 'village_elder',
          name: 'Village Elder',
          location: {
            map: 'village_square',
            x: 10,
            y: 15
          }
        },
        turnIn: {
          type: 'npc',
          npcId: 'village_elder',
          name: 'Village Elder',
          location: {
            map: 'village_square',
            x: 10,
            y: 15
          }
        },
        isRepeatable: false,
        isCompleted: false,
        version: 1
      }
    ];
    
    try {
      const result = await Quest.insertMany(defaultQuests, { ordered: false });
      this.log('success', `✅ Successfully created ${result.length} quests`);
    } catch (error) {
      if ((error as any).code === 11000) {
        this.log('info', 'Quests already exist, skipping quest migration');
      } else {
        throw error;
      }
    }
  }
}

export default MigrationHelper;
