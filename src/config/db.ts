import mongoose from 'mongoose';
import { env } from './env.js';

// Reject filter fields that are not defined in the schema.
mongoose.set('strictQuery', true);

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
    // Indexes are synced explicitly by the seed script in production.
    autoIndex: !env.isProduction,
  });
  console.info(`MongoDB connected: ${mongoose.connection.name}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
