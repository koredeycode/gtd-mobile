import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import Category from './models/Category'
import Habit from './models/Habit'
import Log from './models/Log'
import { schema } from './schema'

// First, create the adapter to the underlying database:
// First, create the adapter to the underlying database:
let adapter;
let db: Database | undefined;

try {
  adapter = new SQLiteAdapter({
    schema,
    // (You might want to comment out migrations if you're not using them yet)
    // migrations,
    // dbName: 'myapp', // optional, default is 'watermelon'
    jsi: false, /* Platform.OS === 'ios' */
    onSetUpError: error => {
      // Database failed to load -- often because of schema changes if not using migrations
      // For now, we'll just log it. In production, you might want to wipe the DB.
      console.error('Database failed to load', error)
    }
  });

  // Then, make a Watermelon database from it!
  db = new Database({
    adapter,
    modelClasses: [
      Habit,
      Log,
      Category,
    ],
  });
} catch (e) {
  console.warn("Failed to initialize WatermelonDB. This is expected if running in Expo Go without native code.", e);
}

export const database = db;
