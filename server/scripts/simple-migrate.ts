import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import chalk from 'chalk';

// Simple logger that always outputs to console
const log = {
  info: (msg: string, ...args: any[]) => {
    console.log(chalk.blue(`[${new Date().toISOString()}] [INFO] ${msg}`));
    if (args.length > 0) console.log(...args);
  },
  success: (msg: string, ...args: any[]) => {
    console.log(chalk.green(`[${new Date().toISOString()}] [SUCCESS] ${msg}`));
    if (args.length > 0) console.log(...args);
  },
  error: (msg: string, ...args: any[]) => {
    console.error(chalk.red(`[${new Date().toISOString()}] [ERROR] ${msg}`));
    if (args.length > 0) console.error(...args);
  },
  warn: (msg: string, ...args: any[]) => {
    console.warn(chalk.yellow(`[${new Date().toISOString()}] [WARN] ${msg}`));
    if (args.length > 0) console.warn(...args);
  },
  debug: (msg: string, ...args: any[]) => {
    // Always show debug in this test
    console.log(chalk.gray(`[${new Date().toISOString()}] [DEBUG] ${msg}`));
    if (args.length > 0) console.log(...args);
  }
};

// Log environment for debugging
log.debug('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI ? '***' : 'Not set',
  PWD: process.cwd(),
  NODE_PATH: process.env.NODE_PATH,
  PATH: process.env.PATH
});

class MigrationHelper {
  private connection: mongoose.Connection;
  
  constructor(connection: mongoose.Connection) {
    this.connection = connection;
  }
  
  public async migrateUsers(): Promise<void> {
    log.info('Starting user migration...');
    
    try {
      const User = this.connection.model('User');
      const userCount = await User.countDocuments();
      
      if (userCount === 0) {
        log.info('No users found, creating default admin user...');
        const hashedPassword = await require('bcryptjs').hash('admin123', 10);
        
        await User.create({
          username: 'admin',
          email: 'admin@rpg-game.com',
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
          lastLogin: new Date(),
          settings: { 
            theme: 'dark', 
            language: 'hu', 
            notifications: { 
              email: true, 
              push: true 
            } 
          }
        });
        
        log.success('✅ Default admin user created successfully');
      } else {
        log.info(`Found ${userCount} users, no migration needed`);
      }
    } catch (error) {
      log.error('Error in user migration:', error);
      throw error;
    }
  }
  
  public async runMigrations(): Promise<void> {
    log.info('Starting migrations...');
    
    try {
      await this.migrateUsers();
      log.success('✅ All migrations completed successfully');
    } catch (error) {
      log.error('❌ Migration failed:', error);
      throw error;
    }
  }
}

async function main() {
  const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rpg-game';
  
  log.info('Starting migration process...');
  log.debug(`MongoDB URI: ${MONGODB_URI}`);
  
  const client = new MongoClient(MONGODB_URI);
  let mongooseConnection: typeof mongoose | null = null;
  
  try {
    // Test native MongoDB connection
    log.info('Testing MongoDB connection...');
    await client.connect();
    log.success('✅ Successfully connected to MongoDB');
    
    const db = client.db();
    log.info(`Using database: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    log.info(`Found ${collections.length} collections:`, collections.map(c => c.name));
    
    // Connect with Mongoose
    log.info('Connecting with Mongoose...');
    mongooseConnection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    } as mongoose.ConnectOptions);
    
    log.success('✅ Successfully connected with Mongoose');
    
    // Run migrations
    const migrationHelper = new MigrationHelper(mongooseConnection.connection);
    await migrationHelper.runMigrations();
    
    log.success('🎉 Migration process completed successfully');
    process.exit(0);
  } catch (error) {
    log.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    // Close connections
    if (mongooseConnection) {
      try {
        await mongooseConnection.connection.close();
        log.info('Closed Mongoose connection');
      } catch (closeError) {
        log.error('Error closing Mongoose connection:', closeError);
      }
    }
    
    try {
      await client.close();
      log.info('Closed MongoDB client');
    } catch (closeError) {
      log.error('Error closing MongoDB client:', closeError);
    }
  }
}

// Run the migration
main().catch(err => {
  log.error('Unhandled error in main:', err);
  process.exit(1);
});
