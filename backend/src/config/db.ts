import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/synapsehr';
    console.log(`Connecting to MongoDB at: ${connStr.replace(/:([^:@]+)@/, ':****@')}`);
    
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Do not call process.exit(1) in serverless environments — it crashes the function
    throw error;
  }
};
