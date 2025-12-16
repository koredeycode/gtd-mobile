import { drizzle, ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import * as schema from './schema';

export const dbName = 'gtd.db';

// Singleton instances
let dbInstance: ExpoSQLiteDatabase<typeof schema> | null = null;
let sqliteDbInstance: SQLiteDatabase | null = null;
let connectionPromise: Promise<SQLiteDatabase> | null = null;

const _initConnection = async (): Promise<SQLiteDatabase> => {
  if (sqliteDbInstance) {
    return sqliteDbInstance;
  }
  
  // Prevent race conditions by holding a single promise
  if (!connectionPromise) {
    connectionPromise = (async () => {
      console.log('Beginning DB init...');
      console.log('openDatabaseAsync type:', typeof openDatabaseAsync);
      console.log('drizzle type:', typeof drizzle);
      
      if (typeof openDatabaseAsync !== 'function') throw new Error('openDatabaseAsync is not a function');
      if (typeof drizzle !== 'function') throw new Error('drizzle is not a function');

      const db = await openDatabaseAsync(dbName);
      sqliteDbInstance = db;
      // Drizzle instance is lightweight, can be recreated or cached.
      // We cache it to avoid re-creating it 
      dbInstance = drizzle(db, { schema });
      return db;
    })();
  }

  return connectionPromise;
};

export const getRawDB = async (): Promise<SQLiteDatabase> => {
  return _initConnection();
};

export const getDB = async () => {
  await _initConnection();
  if (!dbInstance) {
    // Should not happen if _initConnection does its job, but for safety
    throw new Error('Database initialized but drizzle instance is missing');
  }
  return dbInstance;
};

export const initDatabase = async () => {
  const db = await getRawDB();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      is_archived BOOLEAN DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      category_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      frequency_json TEXT NOT NULL,
      type TEXT NOT NULL,
      goal_id TEXT,
      is_archived BOOLEAN DEFAULT 0,
      sync_status TEXT DEFAULT 'synced',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      value BOOLEAN NOT NULL,
      text TEXT,
      sync_status TEXT DEFAULT 'synced',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
    );
  `);

  console.log('Database initialized successfully');
};

export const clearDatabase = async () => {
    const db = await getRawDB();
    await db.execAsync(`
        DROP TABLE IF EXISTS logs;
        DROP TABLE IF EXISTS habits;
        DROP TABLE IF EXISTS categories;
    `);
  console.log('Database cleared (tables dropped). Re-initializing...');
  await initDatabase();
};
