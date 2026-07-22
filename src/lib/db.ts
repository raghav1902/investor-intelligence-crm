import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    memoryServer: MongoMemoryServer | null;
  };
}

if (!global.__mongoose) {
  global.__mongoose = { conn: null, promise: null, memoryServer: null };
}

const cached = global.__mongoose;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    let uri = process.env.MONGODB_URI;

    if (!uri) {
      // Use a fixed port (27018) so all Next.js worker threads & hot-reloads connect to the EXACT SAME DB
      const FIXED_PORT = 27018;
      const FIXED_URI = `mongodb://127.0.0.1:${FIXED_PORT}/investor_contacts`;

      if (!cached.memoryServer) {
        try {
          cached.memoryServer = await MongoMemoryServer.create({
            instance: {
              port: FIXED_PORT,
              dbName: 'investor_contacts',
            },
          });
          uri = cached.memoryServer.getUri();
          console.log(`✅ Embedded MongoMemoryServer started on fixed port ${FIXED_PORT}: ${uri}`);
        } catch (err) {
          // If port 27018 is already occupied by a previously started MongoMemoryServer instance, connect to it directly!
          console.log(`⚡ MongoMemoryServer already running on port ${FIXED_PORT}. Connecting to shared instance...`);
          uri = FIXED_URI;
        }
      } else {
        uri = cached.memoryServer.getUri();
      }
    }

    cached.promise = mongoose
      .connect(uri || 'mongodb://127.0.0.1:27018/investor_contacts', opts)
      .then((mongooseInstance) => {
        console.log('✅ Connected to MongoDB successfully.');
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
