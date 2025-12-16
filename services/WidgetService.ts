import { eq } from 'drizzle-orm';
import { getDB } from '../db';
import { habits, logs } from '../db/schema';

export interface WidgetData {
  total: number;
  completed: number;
  progress: number;
  topHabits: Array<{
    id: string;
    title: string;
    completed: boolean;
    streak?: number;
  }>;
}

export const getWidgetData = async (): Promise<WidgetData> => {
  try {
    const db = await getDB();
    const today = new Date().toISOString().split('T')[0];

    // 1. Get all active habits
    // Note: In a real app we should filter by frequency_json based on day of week
    const allHabits = await db.query.habits.findMany({
      where: eq(habits.is_archived, false),
    });

    // 2. Get logs for today
    const todayLogs = await db.query.logs.findMany({
      where: eq(logs.date, today),
    });

    const logMap = new Map(todayLogs.map(l => [l.habit_id, l.value]));

    // 3. Calculate stats
    let total = 0;
    let completed = 0;
    const topHabitsList = [];

    for (const habit of allHabits) {
      // TODO: Filter by frequency here if needed. For now assuming all habits are daily or valid.
      total++;
      const isCompleted = logMap.get(habit.id) === true;
      if (isCompleted) {
        completed++;
      }

      // Add to list (limit to 3-4 for Medium Widget)
      if (topHabitsList.length < 4) {
        topHabitsList.push({
          id: habit.id,
          title: habit.title,
          completed: isCompleted,
          streak: 0, // Placeholder
        });
      }
    }

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      progress,
      topHabits: topHabitsList,
    };
  } catch (error) {
    console.error('Error fetching widget data:', error);
    // Return dummy data in case of error (e.g. DB not ready in headless mode)
    return {
      total: 8,
      completed: 6,
      progress: 75,
      topHabits: [
        { id: '1', title: 'Go for a 30-min run', completed: false, streak: 12 },
        { id: '2', title: 'Read 20 pages', completed: true, streak: 3 },
        { id: '3', title: 'Meditate', completed: false, streak: 8 },
      ],
    };
  }
};
