import { api } from '../api/client';
import { getDB } from '../db';
import { authService } from './auth.service';
import { categoryService } from './category.service';

export interface SyncPayload {
  last_pulled_at: number;
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
  async syncData(payload: SyncPayload): Promise<SyncResponse> {
    return await api.post<SyncResponse>('/api/v1/sync', payload);
  },

  async syncCategories(): Promise<void> {
      const db = await getDB();
      const categories = await categoryService.getCategories();
      for (const cat of categories) {
          await db.runAsync(
              `INSERT OR REPLACE INTO categories (id, name, color, icon, is_archived, created_at, updated_at)
               VALUES (?, ?, ?, 'label', 0, ?, ?)`,
              [
                  cat.id, 
                  cat.name, 
                  cat.color, 
                  new Date(cat.createdAt || Date.now()).getTime(),
                  new Date(cat.updatedAt || Date.now()).getTime()
              ]
          );
      }
  },

  async syncUserData(): Promise<{ hasData: boolean }> {
      const db = await getDB();
      
      // Sync Habits and Logs (Pull from 0)
      const syncResponse = await this.syncData({
          last_pulled_at: 0, // Pull everything
          changes: {
              habits: { created: [], updated: [], deleted: [] },
              logs: { created: [], updated: [], deleted: [] }
          }
      });

      console.dir(syncResponse, { depth: null });
      
      const { changes } = syncResponse;

      // Process Habits
      if (changes.habits.created.length > 0 || changes.habits.updated.length > 0) {
           const habitsToSave = [...changes.habits.created, ...changes.habits.updated];
           for (const habit of habitsToSave) {
               // Handle potential camelCase vs snake_case differences
               const categoryId = habit.category_id || habit.categoryId;
               const frequencyJson = habit.frequency_json || habit.frequencyJson;
               const createdAt = habit.created_at || habit.createdAt;
               const updatedAt = habit.updated_at || habit.updatedAt;

               if (!categoryId) {
                   console.error('Missing category_id for habit:', habit);
                   continue; // Skip if mandatory field is missing
               }

               await db.runAsync(
                  `INSERT OR REPLACE INTO habits (id, category_id, title, description, frequency, type, goal_id, is_archived, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                   [
                       habit.id,
                       categoryId,
                       habit.title,
                       habit.description || null,
                       typeof frequencyJson === 'string' ? frequencyJson : JSON.stringify(frequencyJson), 
                       habit.type || 'build', 
                       habit.goal_id || habit.goalId || null,
                       habit.is_archived || 0,
                       new Date(createdAt || Date.now()).getTime(),
                       new Date(updatedAt || Date.now()).getTime()
                   ]
               );
           }
      }

      // Process Logs
      if (changes.logs.created.length > 0 || changes.logs.updated.length > 0) {
          const logsToSave = [...changes.logs.created, ...changes.logs.updated];
          for (const log of logsToSave) {
               const habitId = log.habit_id || log.habitId;
               const userId = log.user_id || log.userId;
               const createdAt = log.created_at || log.createdAt;
               const updatedAt = log.updated_at || log.updatedAt;

               if (!habitId || !userId) {
                    console.error('Missing habit_id or user_id for log:', log);
                    continue;
               }

               await db.runAsync(
                  `INSERT OR REPLACE INTO logs (id, habit_id, user_id, date, value, text, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                   [
                       log.id,
                       habitId,
                       userId,
                       log.date,
                       log.value ? 1 : 0,
                       log.text || null,
                       new Date(createdAt || Date.now()).getTime(),
                       new Date(updatedAt || Date.now()).getTime()
                   ]
               );
          }
      }

      // Handle deletions
      if (changes.habits.deleted.length > 0) {
          for (const id of changes.habits.deleted) {
              await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
          }
      }
      if (changes.logs.deleted.length > 0) {
          for (const id of changes.logs.deleted) {
              await db.runAsync('DELETE FROM logs WHERE id = ?', [id]);
          }
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
      const createdHabits = await db.getAllAsync<any>('SELECT * FROM habits WHERE sync_status = "created"');
      // const updatedHabits = await db.getAllAsync<any>('SELECT * FROM habits WHERE sync_status = "updated"'); // Not fully implemented in UI yet
      const createdLogs = await db.getAllAsync<any>('SELECT * FROM logs WHERE sync_status = "created"');
      const updatedLogs = await db.getAllAsync<any>('SELECT * FROM logs WHERE sync_status = "updated"');

      // 2. Construct Payload
      if (createdHabits.length === 0 && createdLogs.length === 0 && updatedLogs.length === 0) {
          console.log('No changes to sync.');
          return;
      }
      
      const userId = await authService.getUserId();

      // Map DB snake/camel casing if needed. DB is storing snake_case fields as per schemas. 
      // But we need to ensure payload matches API expectation.
      // API expects: 
      // habits: { created: [...], updated: [...], deleted: [] }
      // logs: { created: [...], updated: [...], deleted: [] }
      
      const payload: SyncPayload = {
          last_pulled_at: 0, // In a real bidirectional sync, we'd use the stored timestamp
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
                          // Fallback or keep as is, but API likely needs object
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
                  updated: [],
                  deleted: []
              },
              logs: {
                  created: createdLogs.map(l => ({
                      id: l.id,
                      habit_id: l.habit_id,
                      user_id: l.user_id,
                      date: l.date,
                      value: l.value === 1,
                      text: l.text,
                      created_at: new Date(l.created_at).toISOString(),
                      updated_at: new Date(l.updated_at).toISOString()
                  })),
                  updated: updatedLogs.map(l => ({
                      id: l.id,
                      habit_id: l.habit_id,
                      user_id: l.user_id,
                      date: l.date,
                      value: l.value === 1,
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
      const response = await this.syncData(payload);

      // 4. Update local status on success
      // We assume if API returns success, all were saved. 
      // Ideally API returns list of synced IDs, but we'll optimistic update for now.
      
      const updateToSynced = async (table: string, ids: string[]) => {
          if (ids.length === 0) return;
          const placeholders = ids.map(() => '?').join(',');
          await db.runAsync(
              `UPDATE ${table} SET sync_status = "synced" WHERE id IN (${placeholders})`,
              ids
          );
      };

      await updateToSynced('habits', createdHabits.map(h => h.id));
      await updateToSynced('logs', [...createdLogs, ...updatedLogs].map(l => l.id));
      
      console.log('Sync push successful.');
      
      // Optionally trigger pull logic here to get updates from server
      await this.syncUserData();
  }
};
