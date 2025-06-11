// Simple test migration script
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import chalk from 'chalk';

// Simple logger
const log = {
  info: (msg: string, ...args: any[]) => console.log(chalk.blue(`[INFO] ${msg}`), ...args),
  success: (msg: string, ...args: any[]) => console.log(chalk.green(`[SUCCESS] ${msg}`), ...args),
  error: (msg: string, ...args: any[]) => console.error(chalk.red(`[ERROR] ${msg}`), ...args),
  warn: (msg: string, ...args: any[]) => console.warn(chalk.yellow(`[WARN] ${msg}`), ...args),
  debug: (msg: string, ...args: any[]) => console.log(chalk.gray(`[DEBUG] ${msg}`), ...args)
};

async function runTestMigration() {
  const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rpg-game';
  
  log.info('Starting test migration...');
  log.debug(`Connecting to MongoDB at: ${MONGODB_URI}`);
  
  // Test with native MongoDB client first
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // Test native MongoDB connection
    await client.connect();
    log.success('✅ Successfully connected to MongoDB with native client');
    
    const db = client.db();
    log.info(`Using database: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    log.info(`Found ${collections.length} collections:`, collections.map(c => c.name));
    
    // Test Mongoose connection
    log.info('Testing Mongoose connection...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    } as mongoose.ConnectOptions);
    
    log.success('✅ Successfully connected with Mongoose');
    
    // Test a simple model operation
    const TestModel = mongoose.model('Test', new mongoose.Schema({
      name: String,
      value: Number
    }));
    
    // Create a test document
    const testDoc = await TestModel.create({ name: 'test', value: 1 });
    log.success('✅ Created test document:', testDoc);
    
    // Clean up
    await TestModel.deleteMany({});
    log.info('✅ Cleaned up test documents');
    
    return true;
  } catch (error) {
    log.error('Migration error:', error);
    return false;
  } finally {
    // Close connections
    await mongoose.connection.close();
    await client.close();
    log.info('Closed all database connections');
  }
}

// Run the test migration
runTestMigration()
  .then(success => {
    log[success ? 'success' : 'error'](`Test migration ${success ? 'succeeded' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    log.error('Unhandled error in test migration:', err);
    process.exit(1);
  });
