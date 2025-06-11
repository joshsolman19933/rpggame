// Simple test script to verify TypeScript compilation and execution
console.log('Test script started');
console.log('Environment:', process.env.NODE_ENV);
console.log('MongoDB URI:', process.env.MONGO_URI || 'Not set');

// Test MongoDB connection
import { MongoClient } from 'mongodb';

async function testConnection() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/rpg-game';
  console.log('Attempting to connect to MongoDB at:', uri);
  
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
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
testConnection()
  .then(success => {
    console.log('Test completed:', success ? '✅ Success' : '❌ Failed');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
