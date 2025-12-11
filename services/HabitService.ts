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
  },

  async getGlobalStats(): Promise<{ 
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completionRate: number;
  }> {
    const db = await getDB();
    
    // 1. Fetch all data needed
    const allLogs = await db.select().from(schema.logs).where(eq(schema.logs.value, true)); // Only completed logs
    const allHabits = await db.select().from(schema.habits).where(eq(schema.habits.is_archived, false));

    // 2. Calculate Total Completions
    const totalCompletions = allLogs.length;

    // 3. Calculate Completion Rate (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    const sub30Logs = allLogs.filter(l => l.date >= thirtyDaysAgoStr);
    let completionRate = 0;
    if (allHabits.length > 0) {
        // Approximate: potential completions = active habits * 30 days
        const possible = allHabits.length * 30;
        completionRate = Math.round((sub30Logs.length / possible) * 100);
        if (completionRate > 100) completionRate = 100; // Cap at 100%
    }

    // 4. Calculate Streaks (Global across all habits? Or at least one habit done per day?)
    // "Current Streak" usually means: Consecutive days where *at least one* habit was completed.
    // Let's aggregate logs by date.
    const distinctDates = [...new Set(allLogs.map(l => l.date))].sort();

    const currentStreak = this.calculateCurrentStreak(distinctDates);
    const longestStreak = this.calculateLongestStreak(distinctDates);

    return {
        currentStreak,
        longestStreak,
        totalCompletions,
        completionRate
    };
  },

  calculateCurrentStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if the streak is active (completed today OR yesterday)
    const lastDate = sortedDates[sortedDates.length - 1];
    if (lastDate !== today && lastDate !== yesterday) {
        return 0;
    }

    let streak = 0;
    // Walk backwards
    // We need to verify consecutiveness.
    // Converting to timestamps might be safer to avoid timezone edge cases with simple string comparison if we iterate, 
    // but dates are stored as YYYY-MM-DD so simple string logic or Date object logic is needed for "prev day" check.
    
    // Efficient way: start from the end, check gap between dates.
    // pointer at last index.
    let currentDateStr = lastDate;
    let i = sortedDates.length - 1;

    while (i >= 0) {
        const dateAtIndex = sortedDates[i];
        
        // If it's the same date (shouldn't happen directly if distinctive, but for safety)
        if (dateAtIndex === currentDateStr) {
            streak++;
            // Move target expected date to previous day
            const d = new Date(currentDateStr);
            d.setDate(d.getDate() - 1);
            currentDateStr = d.toISOString().split('T')[0];
            i--;
        } else {
            // Gap found
            break;
        }
    }

    return streak;
  },

  calculateLongestStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    let maxStreak = 0;
    let currentStreak = 0;
    let prevDateStr: string | null = null;

    for (const dateStr of sortedDates) {
        if (!prevDateStr) {
            currentStreak = 1;
            maxStreak = 1;
            prevDateStr = dateStr;
            continue;
        }

        // Calculate difference in days
        // We know sortedDates is sorted ascending.
        const prev = new Date(prevDateStr);
        const curr = new Date(dateStr);
        const diffTime = Math.abs(curr.getTime() - prev.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays === 1) {
            // Consecutive
            currentStreak++;
        } else {
            // Gap
            currentStreak = 1; 
        }

        if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
        }
        prevDateStr = dateStr;
    }

    return maxStreak;
  }
};
