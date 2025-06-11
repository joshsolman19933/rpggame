// Minimal migration script with direct MongoDB access
import { MongoClient } from 'mongodb';
import { hash } from 'bcryptjs';

async function runMigration() {
  console.log('=== STARTING MIGRATION ===');
  
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
    
    // Check if admin user exists
    const users = db.collection('users');
    const adminExists = await users.findOne({ username: 'admin' });
    
    if (adminExists) {
      console.log('ℹ️ Admin user already exists, skipping creation');
    } else {
      console.log('Creating admin user...');
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
      
      console.log('✅ Admin user created successfully');
    }
    
    console.log('\n=== MIGRATION COMPLETED SUCCESSFULLY ===');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Run the migration
runMigration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
