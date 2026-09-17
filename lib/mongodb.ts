import { MongoClient, type Db } from "mongodb";

const MONGODB_DB = process.env.MONGODB_DB || "expense_tracker";

/**
 * Next.js route handlers run as serverless functions and can be re-invoked
 * (or hot-reloaded in dev) without the module scope being reset. Caching the
 * client/connection promise on `global` prevents exhausting MongoDB's
 * connection pool by opening a new connection on every invocation.
 *
 * The promise is created lazily (on first `getDb()` call) rather than at
 * module load time, so importing this module never throws — Next.js
 * evaluates route/page modules during the build's page-data collection
 * step, before `MONGODB_URI` is necessarily available.
 */
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Define it in .env.local (see .env.local.example)."
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri, { maxPoolSize: 10 }).connect();
    }
    return global._mongoClientPromise;
  }

  // In production, one client is created per warm serverless instance and
  // reused across invocations via this module-scoped cache.
  if (!cachedClientPromise) {
    cachedClientPromise = new MongoClient(uri, { maxPoolSize: 10 }).connect();
  }
  return cachedClientPromise;
}

let cachedClientPromise: Promise<MongoClient> | undefined;

/** Resolves the cached MongoClient and returns the application database. */
export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(MONGODB_DB);
}

export const TRANSACTIONS_COLLECTION = "transactions";
