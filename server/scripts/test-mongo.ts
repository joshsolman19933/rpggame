import { MongoClient } from 'mongodb';

async function testMongoConnection() {
  console.log('=== MONGODB CONNECTION TEST ===');
  
  const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rpg-game';
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });
  
  try {
    // Test connection
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Test database access
    const db = client.db();
    console.log(`Using database: ${db.databaseName}`);
    
    // List collections
    console.log('Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Test a simple query
    console.log('\nTesting users collection...');
    const users = db.collection('users');
    const userCount = await users.countDocuments();
    console.log(`Found ${userCount} users in the database`);
    
    if (userCount > 0) {
      console.log('Sample user:');
      const sampleUser = await users.findOne();
      console.log(JSON.stringify(sampleUser, null, 2));
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    return false;
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

// Run the test
testMongoConnection()
  .then(success => {
    console.log(`\nTest ${success ? 'succeeded' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
