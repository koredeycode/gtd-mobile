import * as Drizzle from 'drizzle-orm';
import { api } from '../api/client';
import { getDB } from '../db';
import * as schema from '../db/schema';
import { authService } from './auth.service';
import { categoryService } from './category.service';

export interface PushPayload {
  changes: {
    habits: {
      created: any[];
      updated: any[];
      deleted: string[];
    };
    logs: {
      created: any[];
      updated: any[];
      deleted: string[];
    };
  };
}

export interface PullPayload {
  last_pulled_at: number;
}

export interface SyncResponse {
  changes: {
    habits: {
      created: any[];
      updated: any[];
      deleted: string[];
    };
    logs: {
      created: any[];
      updated: any[];
      deleted: string[];
    };
  };
  timestamp: number;
}

export const syncService = {
  async pushData(payload: PushPayload): Promise<SyncResponse> {
    if (!api || typeof api.post !== 'function') {
        throw new Error('API client is not correctly initialized');
    }
    return await api.post<SyncResponse>('/sync/push', payload);
  },

  async pullData(payload: PullPayload): Promise<SyncResponse> {
    if (!api || typeof api.post !== 'function') {
        throw new Error('API client is not correctly initialized');
    }
    return await api.post<SyncResponse>('/sync/pull', payload);
  },

  async syncCategories(): Promise<void> {
      const db = await getDB();
      if (!categoryService || typeof categoryService.getCategories !== 'function') {
          throw new Error('CategoryService is not correctly initialized');
      }
      const categories = await categoryService.getCategories();
      
      for (const cat of categories) {
          const now = Date.now();
          const createdAt = cat.createdAt ? new Date(cat.createdAt).getTime() : now;
          const updatedAt = cat.updatedAt ? new Date(cat.updatedAt).getTime() : now;
          
          await db.insert(schema.categories).values({
              id: cat.id,
              name: cat.name,
              color: cat.color,
              icon: 'label',
              is_archived: false,
              created_at: createdAt,
              updated_at: updatedAt
          }).onConflictDoUpdate({
              target: schema.categories.id,
              set: {
                  name: cat.name,
                  color: cat.color,
                  icon: 'label',
                  is_archived: false,
                  updated_at: updatedAt
              }
          });
      }
  },

  async syncUserData(): Promise<{ hasData: boolean }> {
      const db = await getDB();
      
      // Sync Habits and Logs (Pull from 0)
      const syncResponse = await this.pullData({
          last_pulled_at: 0, // Pull everything
      });

      console.dir(syncResponse, { depth: null });
      
      const { changes } = syncResponse;

      // Process Habits
      if (changes.habits.created.length > 0 || changes.habits.updated.length > 0) {
           const habitsToSave = [...changes.habits.created, ...changes.habits.updated];
           for (const habit of habitsToSave) {
               // Handle potential camelCase vs snake_case differences
               const categoryId = habit.category_id || habit.categoryId;
               // snake_case schema expects category_id, so we are good if we map correctly.
               const frequencyJson = habit.frequency_json || habit.frequencyJson;
               const createdAt = habit.created_at || habit.createdAt;
               const updatedAt = habit.updated_at || habit.updatedAt;

               if (!categoryId) {
                   console.error('Missing category_id for habit:', habit);
                   continue; // Skip if mandatory field is missing
               }
               
               const habitData = {
                   id: habit.id,
                   category_id: categoryId,
                   title: habit.title,
                   description: habit.description || null,
                   frequency: typeof frequencyJson === 'string' ? frequencyJson : JSON.stringify(frequencyJson),
                   type: habit.type || 'build',
                   goal_id: habit.goal_id || habit.goalId || null,
                   is_archived: habit.is_archived ? true : false, // ensure boolean
                   sync_status: 'synced', // Coming from server, so it's synced
                   created_at: new Date(createdAt || Date.now()).getTime(),
                   updated_at: new Date(updatedAt || Date.now()).getTime()
               };

               await db.insert(schema.habits).values(habitData).onConflictDoUpdate({
                   target: schema.habits.id,
                   set: habitData
               });
           }
      }

      // Process Logs
      if (changes.logs.created.length > 0 || changes.logs.updated.length > 0) {
          const logsToSave = [...changes.logs.created, ...changes.logs.updated];
        
          for (const log of logsToSave) {
            console.log({log})
               const habitId = log.habit_id || log.habitId;
               const userId = log.user_id || log.userId;
               const createdAt = log.created_at || log.createdAt;
               const updatedAt = log.updated_at || log.updatedAt;

               if (!habitId || !userId) {
                    console.error('Missing habit_id or user_id for log:', log);
                    continue;
               }



               const logData = {
                   id: log.id,
                   habit_id: habitId,
                   user_id: userId,
                   date: log.date,
                   value: log.value,
                   text: log.text,
                   sync_status: 'synced',
                   created_at: new Date(createdAt || Date.now()).getTime(),
                   updated_at: new Date(updatedAt || Date.now()).getTime()
               };

               await db.insert(schema.logs).values(logData).onConflictDoUpdate({
                   target: schema.logs.id,
                   set: logData
               });
          }
      }

      // Handle deletions
      if (changes.habits.deleted.length > 0) {
          await db.delete(schema.habits).where(Drizzle.inArray(schema.habits.id, changes.habits.deleted));
      }
      if (changes.logs.deleted.length > 0) {
          await db.delete(schema.logs).where(Drizzle.inArray(schema.logs.id, changes.logs.deleted));
      }

      // Store new timestamp?
      // const newTimestamp = syncResponse.timestamp;
      // await SecureStore.setItemAsync('last_pulled_at', newTimestamp.toString()); 
      // (Implementation of storage is separate task but good to note)

      const hasData = (changes.habits.created.length + changes.habits.updated.length) > 0;
      return { hasData };
  },

  async pushChanges(): Promise<void> {
      const db = await getDB();
      
      // 1. Gather pending changes
      const createdHabits = await db.select().from(schema.habits).where(Drizzle.eq(schema.habits.sync_status, 'created'));
      // const updatedHabits = await db.select().from(schema.habits).where(eq(schema.habits.syncStatus, 'updated'));
      const createdLogs = await db.select().from(schema.logs).where(Drizzle.eq(schema.logs.sync_status, 'created'));
      const updatedLogs = await db.select().from(schema.logs).where(Drizzle.eq(schema.logs.sync_status, 'updated'));

      // 2. Construct Payload
      if (createdHabits.length === 0 && createdLogs.length === 0 && updatedLogs.length === 0) {
          console.log('No changes to sync.');
          return;
      }
      
      if (!authService || typeof authService.getUserId !== 'function') {
          throw new Error('AuthService is not correctly initialized');
      }
      const userId = await authService.getUserId();
      if (!userId) {
          console.error('Cannot push changes: No user ID found');
          return;
      }

      const payload: PushPayload = {
          changes: {
              habits: {
                  created: createdHabits.map(h => {
                      let frequency = h.frequency;
                      try {
                          if (typeof frequency === 'string') {
                              frequency = JSON.parse(frequency);
                          }
                      } catch (e) {
                          console.error('Failed to parse frequency JSON', e);
                      }

                      return {
                        id: h.id,
                        user_id: userId,
                        category_id: h.category_id,
                        title: h.title,
                        description: h.description,
                        frequency_json: frequency, 
                        type: h.type,
                        goal_id: h.goal_id,
                        is_archived: h.is_archived,
                        max_steak: 0,
                        full_days: [],
                        created_at: new Date(h.created_at).toISOString(),
                        updated_at: new Date(h.updated_at).toISOString()
                      };
                  }),
                  updated: [], // Not implemented yet
                  deleted: []
              },
              logs: {
                  created: createdLogs.map(l => ({
                      id: l.id,
                      habit_id: l.habit_id,
                      user_id: l.user_id,
                      date: l.date,
                      value: l.value,
                      text: l.text,
                      created_at: new Date(l.created_at).toISOString(),
                      updated_at: new Date(l.updated_at).toISOString()
                  })),
                  updated: updatedLogs.map(l => ({
                      id: l.id,
                      habit_id: l.habit_id,
                      user_id: l.user_id,
                      date: l.date,
                      value: l.value,
                      text: l.text,
                      created_at: new Date(l.created_at).toISOString(),
                      updated_at: new Date(l.updated_at).toISOString()
                  })),
                  deleted: []
              }
          }
      };

      // 3. Push to API
      console.log('Pushing changes:', JSON.stringify(payload, null, 2));
      const response = await this.pushData(payload);

      // 4. Update local status on success using Optimistic Locking
      // We only mark as 'synced' if the updated_at hasn't changed since we read it.
      const updateToSynced = async (table: any, items: any[]) => {
          if (items.length === 0) return;
          
          const db = await getDB();
          
          // We process updates in parallel for performance, but for massive sets maybe batching is better.
          // Given this is a personal app, Promise.all is likely fine.
          await Promise.all(items.map(async (item) => {
             await db.update(table)
                .set({ sync_status: 'synced' })
                .where(
                    Drizzle.and(
                        Drizzle.eq(table.id, item.id),
                        Drizzle.eq(table.updated_at, item.updated_at)
                    )
                );
          }));
      };

      await updateToSynced(schema.habits, createdHabits);
      await updateToSynced(schema.logs, [...createdLogs, ...updatedLogs]);
      
      console.log('Sync push successful.');
      
      // Optionally trigger pull logic here to get updates from server
      await this.syncUserData();
  }
};
