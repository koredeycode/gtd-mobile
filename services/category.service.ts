import { api } from '../api/client';

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    return await api.get<Category[]>('/categories');
  },
};
