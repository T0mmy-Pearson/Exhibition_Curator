import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment-specific config
const ENV = process.env.NODE_ENV || 'development';
if (ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

let mongoUri: string;

if (ENV === 'production') {
  mongoUri = process.env.MONGODB_URI || '';
  if (!mongoUri) {
    throw new Error('Production MONGODB_URI is required but not provided');
  }
} else if (ENV === 'test') {
  mongoUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/exhibition_curator_test';
} else {
  mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/exhibition_curator';
}

// MongoDB connection options for better performance and reliability
const connectionOptions = {
  maxPoolSize: ENV === 'production' ? 10 : 5, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // Removed bufferMaxEntries and bufferCommands as they're not supported in newer MongoDB drivers
};

export const connectDB = async () => {
  try {
    console.log(`🔌 Connecting to MongoDB (${ENV} environment)...`);
    await mongoose.connect(mongoUri, connectionOptions);
    console.log(`✅ MongoDB connected successfully to ${ENV} database`);
    
    // Log connection details (without sensitive info)
    const connection = mongoose.connection;
    console.log(`📊 Database: ${connection.db?.databaseName}`);
    console.log(`🌍 Host: ${connection.host}:${connection.port}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    if (ENV === 'production') {
      console.error('🚨 Production database connection failed. Check your MONGODB_URI and network settings.');
    }
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
};