import mongoose, { type Mongoose } from "mongoose";

/**
 * Shape of the cached connection stored on the global object.
 * - `conn`: the resolved Mongoose instance once connected.
 * - `promise`: the in-flight connection attempt, shared by concurrent callers.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * In development, Next.js hot-reloads modules on every change, which would
 * otherwise create a new connection each time. Storing the cache on
 * `globalThis` lets it survive reloads. `var` is required for global
 * declarations to attach to `globalThis`.
 */
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};
globalThis.mongooseCache = cached;

/**
 * Returns a shared Mongoose connection, creating it on first use.
 * Safe to call from any server component, route handler, or server action.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Reuse the existing connection if we already have one.
  if (cached.conn) {
    return cached.conn;
  }

  // Read the URI lazily so importing this module never throws at build time.
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Add it to .env.local."
    );
  }

  // Start a single connection attempt; concurrent callers await the same promise.
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      // Fail fast instead of queueing model operations while disconnected.
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset so the next call can retry instead of reusing a rejected promise.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
