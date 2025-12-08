import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  is_archived: integer('is_archived', { mode: 'boolean' }).default(false),
  created_at: integer('created_at').notNull(),
  updated_at: integer('updated_at').notNull(),
});

export const habits = sqliteTable('habits', {
  id: text('id').primaryKey().notNull(),
  category_id: text('category_id').references(() => categories.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  frequency: text('frequency').notNull(),
  type: text('type').notNull(),
  goal_id: text('goal_id'),
  is_archived: integer('is_archived', { mode: 'boolean' }).default(false),
  sync_status: text('sync_status').default('synced'),
  created_at: integer('created_at').notNull(),
  updated_at: integer('updated_at').notNull(),
});

export const logs = sqliteTable('logs', {
  id: text('id').primaryKey().notNull(),
  habit_id: text('habit_id').references(() => habits.id, { onDelete: 'cascade' }).notNull(),
  user_id: text('user_id').notNull(),
  date: text('date').notNull(),
  value: integer('value', { mode: 'boolean' }).notNull(),
  text: text('text'),
  sync_status: text('sync_status').default('synced'),
  created_at: integer('created_at').notNull(),
  updated_at: integer('updated_at').notNull(),
});
