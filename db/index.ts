import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import Category from './models/Category'
import Habit from './models/Habit'
import Log from './models/Log'
import { schema } from './schema'

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema,
  // (You might want to comment out migrations if you're not using them yet)
  // migrations,
  // dbName: 'myapp', // optional, default is 'watermelon'
  jsi: true, /* Platform.OS === 'ios' */
  onSetUpError: error => {
    // Database failed to load -- often because of schema changes if not using migrations
    // For now, we'll just log it. In production, you might want to wipe the DB.
    console.error('Database failed to load', error)
  }
})

// Then, make a Watermelon database from it!
export const database = new Database({
  adapter,
  modelClasses: [
    Habit,
    Log,
    Category,
  ],
})
