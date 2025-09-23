import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ENV = process.env.NODE_ENV || 'development';

let mongoUri: string;

if (ENV === 'production') {
  mongoUri = process.env.MONGODB_URI || '';
} else if (ENV === 'test') {
  mongoUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/exhibition_curator_test';
} else {
  mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/exhibition_curator';
}

if (!mongoUri) {
  throw new Error('MongoDB connection string not provided');
}

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};