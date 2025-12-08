import { asc, eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { getDB } from '../db';
import * as schema from '../db/schema';
import { Category } from '../db/types';

export const CategoryService = {
  async getAllCategories(): Promise<Category[]> {
    const db = await getDB();
    const result = await db.select().from(schema.categories).where(eq(schema.categories.is_archived, false)).orderBy(asc(schema.categories.name));
    return result;
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'is_archived'> & { id?: string }): Promise<Category> {
    const db = await getDB();
    const id = category.id || Crypto.randomUUID();
    const now = Date.now();

    const newCategory = {
      id,
      name: category.name || '',
      color: category.color || '#000000',
      icon: category.icon || 'label',
      is_archived: false,
      created_at: now,
      updated_at: now
    };

    await db.insert(schema.categories).values(newCategory);

    return newCategory;
  }
};
