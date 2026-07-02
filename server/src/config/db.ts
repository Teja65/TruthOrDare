import mongoose from 'mongoose';
import { User } from '../models/User';

async function dropLegacyUserEmailIndex(): Promise<void> {
  const indexes = await User.collection.indexes();
  const legacyEmailIndex = indexes.find(
    (index) => index.name === 'email_1' && index.unique === true,
  );

  if (!legacyEmailIndex) {
    return;
  }

  await User.collection.dropIndex('email_1');
  console.log('Dropped legacy unique users.email index');
}

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not configured in the environment');
  }

  await mongoose.connect(uri, {
    connectTimeoutMS: 10000,
  });

  console.log('Connected to MongoDB');
  try {
    await dropLegacyUserEmailIndex();
  } catch (error) {
    console.warn('Could not drop legacy unique users.email index:', error);
  }
}
