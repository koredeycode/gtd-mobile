import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

export const dbName = 'gtd.db';

let dbInstance: ReturnType<typeof drizzle> | null = null;
let sqliteDbInstance: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<ReturnType<typeof drizzle>> | null = null;

export const getDB = async () => {
  if (dbInstance) {
    return dbInstance;
  }
  
  if (dbPromise) {
      return dbPromise;
  }

  dbPromise = (async () => {
    if (!sqliteDbInstance) {
        sqliteDbInstance = await SQLite.openDatabaseAsync(dbName);
    }
    dbInstance = drizzle(sqliteDbInstance, { schema });
    return dbInstance;
  })();

  return dbPromise;
};

export const initDatabase = async () => {
  const db = await getDB();
  
  // Create tables using drizzle-kit or manual SQL if migrations aren't set up yet.
  // Since we are migrating from manual SQL, existing tables should be there.
  // But for new installs, we need to ensure tables exist.
  // For now, we will assume the manual SQL fallback is good for safety, or we can rely on Drizzle's push/migration.
  // However, `drizzle-orm` doesn't automatically create tables on init without a migration runner.
  // Given the previous code had manual CREATE TABLE, we should probably keep doing that but maybe with Drizzle's SQL generator or just raw SQL for now to be safe until we full switch to migrations.
  
  // Actually, to fully switch to drizzle, we should ideally use migrations. 
  // But for this task, "switch from sql queries to drizzle orm" might just mean query layer first.
  // Let's keep the manual table creation for now to ensure we don't break existing setups or new installs, 
  // but we can use the original SQL or move to Drizzle's migrate.
  // For simplicity and speed in this session, I will retain the manual table creation logic using raw SQL via the underlying driver if possible, 
  // OR just assume the user handles migrations via `drizzle-kit push` which is common in Expo.
  // But `drizzle-kit push` requires CLI access. In the app, we need to run migrations.
  // Let's use the `execAsync` on the underlying `sqliteDbInstance` for now to be safe, essentially preserving the original `initDatabase` logic but maybe simplified if we trust Drizzle migrations later.
  
  if (!sqliteDbInstance) {
      sqliteDbInstance = SQLite.openDatabaseSync(dbName);
  }

  await sqliteDbInstance.execAsync(`
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
      frequency TEXT NOT NULL,
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
    // We can use drizzle to delete everything or raw sql.
    const db = await getDB();
    if (!sqliteDbInstance) {
        sqliteDbInstance = SQLite.openDatabaseSync(dbName);
    }
    await sqliteDbInstance.execAsync(`
        DELETE FROM logs;
        DELETE FROM habits;
        DELETE FROM categories;
    `);
  console.log('Database cleared');
};
