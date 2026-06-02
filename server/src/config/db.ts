import mongoose from 'mongoose';

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not configured in the environment');
  }

  await mongoose.connect(uri, {
    connectTimeoutMS: 10000,
  });

  console.log('Connected to MongoDB');
}
