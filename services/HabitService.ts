import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { getDB } from '../db';
import * as schema from '../db/schema';
import { Habit, Log } from '../db/types';

export const HabitService = {
  async getAllHabits(): Promise<Habit[]> {
    const db = await getDB();
    const result = await db.select().from(schema.habits).where(eq(schema.habits.is_archived, false)).orderBy(desc(schema.habits.created_at));
    return result;
  },

  async createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'is_archived' | 'sync_status'> & { id?: string }): Promise<Habit> {
    const db = await getDB();
    const id = habit.id || Crypto.randomUUID();
    const now = Date.now();
    
    const newHabit = {
        id,
        category_id: habit.category_id,
        title: habit.title,
        description: habit.description || null,
        frequency: habit.frequency,
        type: habit.type,
        goal_id: habit.goal_id || null,
        is_archived: false,
        sync_status: 'created',
        created_at: now,
        updated_at: now,
    };

    await db.insert(schema.habits).values(newHabit);

    return newHabit as unknown as Habit;
  },

  async getLogsForHabit(habitId: string): Promise<Log[]> {
    const db = await getDB();
    return await db.select().from(schema.logs).where(eq(schema.logs.habit_id, habitId)).orderBy(desc(schema.logs.date));
  },

  async getLogsByDate(date: string): Promise<Log[]> {
    const db = await getDB();
    return await db.select().from(schema.logs).where(eq(schema.logs.date, date));
  },

  async getLogsByDateRange(startDate: string, endDate: string): Promise<Log[]> {
    const db = await getDB();
    return await db.select().from(schema.logs).where(and(gte(schema.logs.date, startDate), lte(schema.logs.date, endDate)));
  },

  async getAllLogs(): Promise<Log[]> {
    const db = await getDB();
    return await db.select().from(schema.logs);
  },

  async createLog(log: Omit<Log, 'id' | 'created_at' | 'updated_at' | 'sync_status'>): Promise<Log> {
    const db = await getDB();
    const id = Crypto.randomUUID();
    const now = Date.now();

    if (!log.habit_id || !log.user_id || !log.date) {
        throw new Error(`Invalid log data: Missing required fields. habit_id=${log.habit_id}, user_id=${log.user_id}, date=${log.date}`);
    }

    const newLog = {
        id,
        habit_id: log.habit_id,
        user_id: log.user_id,
        date: log.date,
        value: log.value === true, // Ensure strictly boolean
        text: log.text || null,
        sync_status: 'created',
        created_at: now,
        updated_at: now,
    };
    
    await db.insert(schema.logs).values(newLog);

    return newLog as unknown as Log;
  },

  async updateLog(id: string, value: boolean, text: string | null): Promise<void> {
    const db = await getDB();
    const now = Date.now();
    console.log('Attempting to update log:', id, value, text);
    
    if (!id) throw new Error('Cannot update log without ID');

    await db.update(schema.logs)
      .set({ 
        value: value === true, // Ensure strictly boolean
        text: text || null, // Ensure null if undefined/empty string passed as undefined
        updated_at: now, 
        sync_status: sql`CASE WHEN sync_status = 'created' THEN 'created' ELSE 'updated' END`
      })
      .where(eq(schema.logs.id, id));
  },

  async deleteLog(id: string): Promise<void> {
    const db = await getDB();
    console.log('Attempting to delete log:', id);
    if (!id) throw new Error('Cannot delete log without ID');
    await db.delete(schema.logs).where(eq(schema.logs.id, id));
  }
};
