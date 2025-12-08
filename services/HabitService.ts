import * as Crypto from 'expo-crypto';
import { getDB } from '../db';
import { Habit, Log } from '../db/types';

export const HabitService = {
  async getAllHabits(): Promise<Habit[]> {
    const db = await getDB();
    const result = await db.getAllAsync<Habit>('SELECT * FROM habits WHERE is_archived = 0 ORDER BY created_at DESC');
    return result;
  },

  async createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'is_archived'> & { id?: string }): Promise<Habit> {
    const db = await getDB();
    const id = habit.id || Crypto.randomUUID();
    const now = Date.now();
    
    await db.runAsync(
      `INSERT INTO habits (id, category_id, title, description, frequency, type, goal_id, is_archived, sync_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'created', ?, ?)`,
      [id, habit.category_id, habit.title, habit.description || null, habit.frequency, habit.type, habit.goal_id || null, now, now]
    );

    return {
      id,
      ...habit,
      description: habit.description || null,
      goal_id: habit.goal_id || null,
      is_archived: false,
      created_at: now,
      updated_at: now
    };
  },

  async getLogsForHabit(habitId: string): Promise<Log[]> {
    const db = await getDB();
    return await db.getAllAsync<Log>('SELECT * FROM logs WHERE habit_id = ? ORDER BY date DESC', [habitId]);
  },

  async getLogsByDate(date: string): Promise<Log[]> {
    const db = await getDB();
    return await db.getAllAsync<Log>('SELECT * FROM logs WHERE date = ?', [date]);
  },

  async createLog(log: Omit<Log, 'id' | 'created_at' | 'updated_at'>): Promise<Log> {
    const db = await getDB();
    const id = Crypto.randomUUID();
    const now = Date.now();

    await db.runAsync(
      `INSERT INTO logs (id, habit_id, user_id, date, value, text, sync_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'created', ?, ?)`,
      [id, log.habit_id, log.user_id, log.date, log.value ? 1 : 0, log.text || null, now, now]
    );

    return {
      id,
      ...log,
      text: log.text || null,
      created_at: now,
      updated_at: now
    };
  },

  async updateLog(id: string, value: boolean, text: string | null): Promise<void> {
    const db = await getDB();
    const now = Date.now();
    await db.runAsync(
      'UPDATE logs SET value = ?, text = ?, updated_at = ?, sync_status = CASE WHEN sync_status = "created" THEN "created" ELSE "updated" END WHERE id = ?',
      [value ? 1 : 0, text, now, id]
    );
  },

  async deleteLog(id: string): Promise<void> {
    const db = await getDB();
    await db.runAsync('DELETE FROM logs WHERE id = ?', [id]);
  }
};
