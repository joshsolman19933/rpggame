#!/usr/bin/env node
/**
 * Adatbázis migrációs szkript
 * Használat: 
 *   - Teljes migráció: npx ts-node scripts/migrate.ts
 *   - Felhasználók migrálása: npx ts-node scripts/migrate.ts --migrate-users
 *   - Reset: npx ts-node scripts/migrate.ts --reset
 */

// Enable debug logging
process.env.DEBUG = 'true';
process.env.DEBUG_COLORS = 'true';

import 'dotenv/config';
import mongoose, { ConnectOptions, Connection } from 'mongoose';
import { connectDB } from '../src/config/db';
import MigrationHelper from '../src/utils/migrationHelper';
import chalk from 'chalk';
import { MongoClient } from 'mongodb';
import debug from 'debug';

// Create debug logger
const log = debug('migration');
const error = debug('migration:error');
const info = debug('migration:info');

// Enable all debug logs
const debugNamespace = process.env.DEBUG || '';
if (debugNamespace === '*' || debugNamespace.includes('migration')) {
  debug.enable('migration*');
}

// Parancssori argumentumok kezelése
const args = process.argv.slice(2);
const shouldMigrateUsers = args.includes('--migrate-users');
const shouldReset = args.includes('--reset');

// Konfiguráció betöltése
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rpg-game';

log('Starting migration script with config:');
log(`- MONGODB_URI: ${MONGODB_URI}`);
log(`- shouldMigrateUsers: ${shouldMigrateUsers}`);
log(`- shouldReset: ${shouldReset}`);
log(`- NODE_ENV: ${process.env.NODE_ENV}`);

// Create debug logger with colors
const logger = {
  info: (msg: string, ...args: any[]) => {
    console.log(chalk.blue(`ℹ️  ${msg}`));
    if (args.length > 0) console.dir(args, { depth: null, colors: true });
  },
  success: (msg: string, ...args: any[]) => {
    console.log(chalk.green(`✅ ${msg}`));
    if (args.length > 0) console.dir(args, { depth: null, colors: true });
  },
  warning: (msg: string, ...args: any[]) => {
    console.warn(chalk.yellow(`⚠️  ${msg}`));
    if (args.length > 0) console.dir(args, { depth: null, colors: true });
  },
  error: (msg: string, error?: any, ...args: any[]) => {
    console.error(chalk.red(`❌ ${msg}`));
    if (error) {
      console.error(chalk.red(error.stack || error.message || error));
    }
    if (args.length > 0) console.dir(args, { depth: null, colors: true });
  },
  debug: (msg: string, ...args: any[]) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray(`🐞 ${msg}`));
      if (args.length > 0) console.dir(args, { depth: null, colors: true });
    }
  }
};

/**
 * Adatbázis kapcsolat ellenőrzése
 */
async function checkConnection(): Promise<boolean> {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    log('Attempting to connect to MongoDB...');
    await client.connect();
    log('✅ MongoDB connection test successful');
    return true;
  } catch (err) {
    error('❌ MongoDB connection test failed', err);
    return false;
  } finally {
    try {
      await client.close();
      log('MongoDB test connection closed');
    } catch (closeErr) {
      error('Error closing MongoDB test connection', closeErr);
    }
  }
}

/**
 * Adatbázis törlése (csak fejlesztéshez!)
 */
async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    logger.error('Database reset is not allowed in production!');
    process.exit(1);
  }

  logger.warning('⚠️  WARNING: This will DROP ALL DATA from the database!');
  logger.warning('Press Ctrl+C to cancel or wait 5 seconds to continue...');

  // Várakozás a megerősítésre
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    logger.debug('Connecting to MongoDB for reset...');
    await client.connect();
    logger.debug('Connected to MongoDB for reset');
    
    const db = client.db();
    logger.debug(`Using database: ${db.databaseName}`);
    
    // Táblák törlése
    logger.info('Listing collections...');
    const collections = await db.listCollections().toArray();
    logger.debug(`Found ${collections.length} collections`, collections.map((c: { name: string }) => c.name));
    
    for (const collection of collections) {
      try {
        logger.debug(`Dropping collection: ${collection.name}`);
        await db.dropCollection(collection.name);
        logger.info(`✅ Dropped collection: ${collection.name}`);
      } catch (dropError) {
        logger.error(`Failed to drop collection ${collection.name}`, dropError);
        throw dropError;
      }
    }
    
    if (collections.length === 0) {
      logger.warning('No collections found to drop');
    }
    
    logger.success('✅ Database reset completed successfully');
  } catch (error) {
    logger.error('❌ Error resetting database', error);
    throw error;
  } finally {
    try {
      await client.close();
      logger.debug('MongoDB connection closed after reset');
    } catch (closeError) {
      logger.error('Error closing MongoDB connection after reset', closeError);
    }
  }
}

// Fő függvény
async function main() {
  logger.info('\n' + '='.repeat(60));
  logger.info('🚀 Starting RPG Game Database Migration');
  logger.info('='.repeat(60) + '\n');
  
  let mongooseConnection: typeof mongoose | null = null;
  
  try {
    logger.info('🔍 Checking database connection...');
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      logger.error('❌ Could not connect to MongoDB. Please make sure MongoDB is running.');
      process.exit(1);
    }
    
    // Reset adatbázis ha szükséges
    if (shouldReset) {
      logger.warning('♻️  Resetting database...');
      await resetDatabase();
      logger.success('✅ Database reset completed');
    } else {
      logger.info('ℹ️  Running in normal migration mode (use --reset to clear database first)');
    }
    
    // Kapcsolódás az adatbázishoz Mongoose-szal
    logger.info('🔌 Connecting to MongoDB with Mongoose...');
    mongooseConnection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    } as ConnectOptions);
    
    logger.success(`✅ Connected to MongoDB: ${MONGODB_URI.split('@').pop() || MONGODB_URI}`);
    
    // Mongoose eseménykezelők
    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warning('Mongoose connection disconnected');
    });
    
    // Migrációs segéd inicializálása
    logger.info('🚀 Initializing migration helper...');
    const migrationHelper = new MigrationHelper(mongooseConnection.connection);
    
    // Migrációk futtatása
    if (shouldMigrateUsers) {
      logger.info('👤 Running user migration only...');
      await migrationHelper.migrateUsers();
    } else {
      logger.info('🔄 Running full migration...');
      await migrationHelper.runMigrations();
    }
    
    logger.success('✨ Migration completed successfully!');
    logger.info('\n' + '='.repeat(60));
    logger.info('✅ Database migration completed successfully!');
    logger.info('='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    logger.error('\n' + '❌'.repeat(15));
    logger.error('MIGRATION FAILED', error);
    logger.error('❌'.repeat(15) + '\n');
    
    // Részletes hiba információ
    if (error instanceof Error) {
      logger.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n') + '\n...',
      });
    }
    
    process.exit(1);
  } finally {
    // Kapcsolat lezárása
    if (mongooseConnection) {
      try {
        await mongooseConnection.connection.close();
        logger.info('👋 Disconnected from MongoDB');
      } catch (closeError) {
        logger.error('Error closing MongoDB connection', closeError);
      }
    }
  }
}

// Futtatás
main().catch(err => {
  logger.error('Unhandled error in main:', err);
  process.exit(1);
});
