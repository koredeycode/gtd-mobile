import * as Crypto from 'expo-crypto';
import { getDB } from '../db';
import { Category } from '../db/types';

export const CategoryService = {
  async getAllCategories(): Promise<Category[]> {
    const db = await getDB();
    return await db.getAllAsync<Category>('SELECT * FROM categories WHERE is_archived = 0 ORDER BY name ASC');
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'is_archived'> & { id?: string }): Promise<Category> {
    const db = await getDB();
    const id = category.id || Crypto.randomUUID();
    const now = Date.now();

    await db.runAsync(
      `INSERT INTO categories (id, name, color, icon, is_archived, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, ?, ?)`,
      [
        id, 
        category.name || '', 
        category.color || '#000000', 
        category.icon || 'label', 
        now, 
        now
      ]
    );

    return {
      id,
      ...category,
      is_archived: false,
      created_at: now,
      updated_at: now
    };
  }
};
