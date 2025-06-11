import { MongoClient } from 'mongodb';
import 'dotenv/config';
import chalk from 'chalk';

async function testConnection() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/rpg-game';
  const client = new MongoClient(uri);

  try {
    console.log(chalk.blue('🔌 Connecting to MongoDB...'));
    await client.connect();
    console.log(chalk.green('✅ Successfully connected to MongoDB'));
    
    // List all databases
    const adminDb = client.db('admin').admin();
    const dbs = await adminDb.listDatabases();
    console.log('\n📂 Available databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (${db.sizeOnDisk ? (db.sizeOnDisk / 1024 / 1024).toFixed(2) + ' MB' : 'size unknown'})`);
    });
    
    // Show collections in rpg-game database
    const db = client.db('rpg-game');
    const collections = await db.listCollections().toArray();
    console.log('\n📊 Collections in rpg-game:');
    if (collections.length > 0) {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    } else {
      console.log('No collections found');
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Connection error:'), error);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

testConnection();
