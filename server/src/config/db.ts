import mongoose from 'mongoose';
import MigrationHelper from '../utils/migrationHelper';

// Adatbázis kapcsolat beállításai
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority' as const, // TypeScript így értelmezi, hogy 'majority' literális típus
};

// Adatbázis kapcsolat létrehozása
const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/rpg-game';
    
    // Kapcsolódás az adatbázishoz
    const connection = await mongoose.connect(mongoURI, MONGO_OPTIONS);
    
    console.log('✅ MongoDB connected successfully');
    
    // Adatmigrációk futtatása
    try {
      const migrationHelper = new MigrationHelper(connection.connection);
      await migrationHelper.runMigrations();
    } catch (migrationError) {
      console.error('❌ Database migration failed:', migrationError);
      // Ne állítsuk le az alkalmazást, csak jelezzük a hibát
    }
    
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// MongoDB kapcsolati események kezelése
mongoose.connection.on('connecting', () => {
  console.log('🔌 Connecting to MongoDB...');});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('error', (err: Error) => {
  console.error('❌ MongoDB connection error:', err);
});

// Kapcsolat lezárása az alkalmazás leállításakor
const gracefulShutdown = async (msg: string, callback?: () => void) => {
  try {
    await mongoose.connection.close();
    console.log(`🛑 MongoDB disconnected through ${msg}`);
    if (callback) callback();
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error during MongoDB disconnection (${msg}):`, err);
    process.exit(1);
  }
};

// Kapcsolat lezárása a process leállításakor
process.on('SIGINT', () => gracefulShutdown('app termination', () => {
  console.log('👋 App terminated');
  process.exit(0);
}));

// Terminál lezáráskor (pl. Ctrl+C a terminálban)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Kezeletlen kivételek esetén
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaught exception');
});

// Kezeletlen Promise elutasítások esetén
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandled rejection');
});

export { connectDB };
export default connectDB;
