import * as SQLite from 'expo-sqlite';

export const dbName = 'gtd.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDB = async () => {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await SQLite.openDatabaseAsync(dbName);
  return dbInstance;
};

export const initDatabase = async () => {
  const db = await getDB();
  
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

  // Migration for existing tables
  try {
    await db.execAsync(`ALTER TABLE habits ADD COLUMN sync_status TEXT DEFAULT 'synced';`);
  } catch (e) {
    // Column likely exists
  }

  try {
    await db.execAsync(`ALTER TABLE logs ADD COLUMN sync_status TEXT DEFAULT 'synced';`);
  } catch (e) {
    // Column likely exists
  }
  
  console.log('Database initialized successfully');
};

export const clearDatabase = async () => {
  const db = await getDB();
  await db.execAsync(`
    DELETE FROM logs;
    DELETE FROM habits;
    DELETE FROM categories;
  `);
  console.log('Database cleared');
};
