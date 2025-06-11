import { MongoClient, ObjectId } from 'mongodb';
import { hash } from 'bcryptjs';

type Migration = {
  name: string;
  up: (db: any) => Promise<void>;
};

const migrations: Migration[] = [
  {
    name: 'create-raw-materials',
    up: async (db) => {
      const materials = db.collection('materials');
      
      const defaultMaterials = [
        {
          name: 'Fa',
          type: 'raw',
          rarity: 'common',
          description: 'Alapvető nyersanyag építkezéshez és kézművességhez.',
          icon: 'wood.png',
          baseValue: 5,
          weight: 1.0,
          stackSize: 100,
          gatherSkill: 'favágás',
          gatherTime: 5, // másodperc
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Kő',
          type: 'raw',
          rarity: 'common',
          description: 'Kemény kő, építkezéshez és eszközök készítéséhez.',
          icon: 'stone.png',
          baseValue: 8,
          weight: 2.5,
          stackSize: 50,
          gatherSkill: 'bányászat',
          gatherTime: 8,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Vasérc',
          type: 'ore',
          rarity: 'uncommon',
          description: 'Nyers vasérc, feldolgozás után használható fegyverek és páncélok készítéséhez.',
          icon: 'iron_ore.png',
          baseValue: 20,
          weight: 3.0,
          stackSize: 25,
          gatherSkill: 'bányászat',
          gatherLevel: 10,
          gatherTime: 12,
          smeltResult: 'vasrúd',
          smeltAmount: 1,
          smeltTime: 30,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Gyógyfű',
          type: 'herb',
          rarity: 'common',
          description: 'Ritka gyógyfű, gyógyitalok készítéséhez használható.',
          icon: 'herb.png',
          baseValue: 15,
          weight: 0.2,
          stackSize: 50,
          gatherSkill: 'gyűjtögetés',
          gatherTime: 6,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Bőr',
          type: 'leather',
          rarity: 'common',
          description: 'Feldolgozott állatbőr, páncélok és felszerelések készítéséhez.',
          icon: 'leather.png',
          baseValue: 12,
          weight: 1.5,
          stackSize: 40,
          craftMaterial: true,
          processedFrom: 'nyers_bőr',
          processTime: 10,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      for (const material of defaultMaterials) {
        const exists = await materials.findOne({ name: material.name as string });
        if (!exists) {
          await materials.insertOne(material);
          console.log(`✅ Létrehozva nyersanyag: ${material.name}`);
        } else {
          console.log(`ℹ️ A(z) ${material.name} nyersanyag már létezik`);
        }
      }
    }
  },
  {
    name: 'create-admin-user',
    up: async (db) => {
      const users = db.collection('users');
      const adminExists = await users.findOne({ username: 'admin' });
      
      if (!adminExists) {
        const hashedPassword = await hash('admin123', 10);
        await users.insertOne({
          username: 'admin',
          email: 'admin@rpg-game.com',
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
          lastLogin: new Date(),
          settings: { 
            theme: 'dark',
            language: 'hu',
            notifications: { email: true, push: true }
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0
        });
        console.log('✅ Created admin user');
      } else {
        console.log('ℹ️ Admin user already exists');
      }
    }
  },
  {
    name: 'create-default-items',
    up: async (db) => {
      const items = db.collection('items');
      const defaultItems = [
        {
          name: 'Bronz Kard',
          type: 'weapon',
          rarity: 'common',
          damage: 10,
          value: 50,
          weight: 2.5,
          description: 'Egyszerű bronz kard kezdő harcosoknak.',
          icon: 'bronze_sword.png',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Bőrpáncél',
          type: 'armor',
          rarity: 'common',
          defense: 5,
          value: 30,
          weight: 5,
          description: 'Egyszerű bőrpáncél védelmet nyújt a harcosoknak.',
          icon: 'leather_armor.png',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Gyógyító Bájital',
          type: 'potion',
          rarity: 'uncommon',
          effect: 'heal',
          value: 25,
          weight: 0.5,
          description: 'Gyógyítja a sérüléseket és visszatölt egy kis életerőt.',
          icon: 'health_potion.png',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Ősi Érem',
          type: 'currency',
          rarity: 'rare',
          value: 100,
          weight: 0.1,
          description: 'Ősi érmék, amelyeket a játék különleges árucikkeinek megvásárlására lehet használni.',
          icon: 'ancient_coin.png',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      for (const item of defaultItems) {
        const exists = await items.findOne({ name: item.name });
        if (!exists) {
          await items.insertOne(item);
          console.log(`✅ Created item: ${item.name}`);
        } else {
          console.log(`ℹ️ Item already exists: ${item.name}`);
        }
      }
    }
  },
  {
    name: 'create-default-skills',
    up: async (db) => {
      const skills = db.collection('skills');
      const defaultSkills = [
        {
          name: 'Erőteljes Csapás',
          type: 'active',
          description: 'Egy erős, kivitelezett csapás az ellenfél ellen.',
          damage: 15,
          manaCost: 10,
          cooldown: 5,
          level: 1,
          icon: 'power_strike.png',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Elsősegély',
          type: 'active',
          description: 'Gyógyítsd meg magad vagy szövetségesedet egy kis mennyiségű életerővel.',
          heal: 10,
          manaCost: 8,
          cooldown: 8,
          level: 1,
          icon: 'first_aid.png',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      for (const skill of defaultSkills) {
        const exists = await skills.findOne({ name: skill.name });
        if (!exists) {
          await skills.insertOne(skill);
          console.log(`✅ Created skill: ${skill.name}`);
        } else {
          console.log(`ℹ️ Skill already exists: ${skill.name}`);
        }
      }
    }
  },
  {
    name: 'create-default-quests',
    up: async (db) => {
      const quests = db.collection('quests');
      const items = db.collection('items');
      const skills = db.collection('skills');
      
      // Get required IDs
      const bronzeSword = await items.findOne({ name: 'Bronz Kard' });
      const firstAidSkill = await skills.findOne({ name: 'Elsősegély' });
      
      if (!bronzeSword || !firstAidSkill) {
        console.log('⚠️ Required items/skills not found for quest creation');
        return;
      }
      
      const defaultQuests = [
        {
          title: 'Első Lépések',
          description: 'Ismerkedj meg a játékkal és szerezz tapasztalati pontokat!',
          objectives: [
            { description: 'Járj körbe a faluban', completed: false },
            { description: 'Beszélj a falusi főemberrel', completed: false },
            { description: 'Gyűjts össze 5 darab gyógyfüvet', completed: false, target: 5, current: 0 }
          ],
          rewards: {
            experience: 100,
            items: [
              { itemId: new ObjectId(bronzeSword._id), quantity: 1 }
            ],
            skills: [
              { skillId: new ObjectId(firstAidSkill._id) }
            ]
          },
          minLevel: 1,
          maxLevel: 5,
          repeatable: false,
          npcGiver: 'Falusi Főember',
          npcTurnIn: 'Falusi Főember',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      for (const quest of defaultQuests) {
        const exists = await quests.findOne({ title: quest.title });
        if (!exists) {
          await quests.insertOne(quest);
          console.log(`✅ Created quest: ${quest.title}`);
        } else {
          console.log(`ℹ️ Quest already exists: ${quest.title}`);
        }
      }
    }
  }
];

async function runMigrations() {
  console.log('=== STARTING MIGRATIONS ===');
  
  const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rpg-game';
  console.log(`Connecting to: ${MONGODB_URI}`);
  
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });
  
  try {
    // Connect to MongoDB
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    console.log(`Using database: ${db.databaseName}`);
    
    // Create migrations collection if it doesn't exist
    const migrationsCollection = db.collection('migrations');
    await migrationsCollection.createIndex({ name: 1 }, { unique: true });
    
    // Run each migration
    for (const migration of migrations) {
      console.log(`\n🔄 Running migration: ${migration.name}`);
      
      // Check if migration was already run
      const existingMigration = await migrationsCollection.findOne({ name: migration.name });
      
      if (existingMigration) {
        console.log(`ℹ️ Migration already applied: ${migration.name}`);
        continue;
      }
      
      try {
        // Run migration
        await migration.up(db);
        
        // Record migration
        await migrationsCollection.insertOne({
          name: migration.name,
          appliedAt: new Date(),
          status: 'completed'
        });
        
        console.log(`✅ Successfully applied migration: ${migration.name}`);
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error applying migration ${migration.name}:`, errorMessage);
        
        // Record failed migration
        await migrationsCollection.updateOne(
          { name: migration.name },
          {
            $set: {
              appliedAt: new Date(),
              status: 'failed',
              error: errorMessage
            }
          },
          { upsert: true }
        );
        
        throw error; // Stop on error
      }
    }
    
    console.log('\n=== ALL MIGRATIONS COMPLETED SUCCESSFULLY ===');
    return true;
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    return false;
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Run migrations
runMigrations()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
