import mongoose from 'mongoose';

// const MONGODB_URI = process.env.DATABASE_URL;
const MONGODB_URI="mongodb+srv://omkardilwaleod:5IkITy8NlMUumzsT@omkar-db.7y30o0c.mongodb.net/?retryWrites=true&w=majority&appName=omkar-DB"

if (!MONGODB_URI) {
  throw new Error('Please define the DATABASE_URL environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect; 