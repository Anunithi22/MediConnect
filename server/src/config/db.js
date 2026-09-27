import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediconnect';
    const conn = await mongoose.connect(mongoUri);

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[Database Error] MongoDB connection error:`, err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(`[Database Warning] MongoDB disconnected. Attempting reconnect...`);
    });

    return conn;
  } catch (error) {
    console.error(`[Database Critical] Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
