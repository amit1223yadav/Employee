import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/synapsehr';
  
  try {
    const db = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

