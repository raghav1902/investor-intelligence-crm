import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, memoryServer: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    let uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('⚡ No MONGODB_URI found in environment. Initializing local embedded MongoMemoryServer...');
      try {
        if (!cached.memoryServer) {
          cached.memoryServer = await MongoMemoryServer.create();
        }
        uri = cached.memoryServer.getUri();
        console.log(`✅ Embedded MongoMemoryServer running at: ${uri}`);
      } catch (err) {
        console.error('❌ Failed to start MongoMemoryServer. Defaulting to mongodb://localhost:27017/investor_contacts', err);
        uri = 'mongodb://localhost:27017/investor_contacts';
      }
    }

    const connectionUri: string = uri || 'mongodb://localhost:27017/investor_contacts';
    cached.promise = mongoose.connect(connectionUri, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB successfully.');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
