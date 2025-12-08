import { api } from '../api/client';

export interface GenerateHabitsRequest {
  goal: string;
  categories: string[];
}

export interface GeneratedCategory {
  name: string;
  habits: { title: string }[];
}

export interface GenerateHabitsResponse {
  categories: GeneratedCategory[];
}

export const habitService = {
  async generateHabits(data: GenerateHabitsRequest): Promise<GenerateHabitsResponse> {
    return await api.post<GenerateHabitsResponse>('/habits/generate', data);
  },

  async bulkCreateHabits(data: CreateBulkHabitsDto): Promise<HabitResponseDto[]> {
    return await api.post<HabitResponseDto[]>('/habits/bulk', data);
  },
};

export interface CreateBulkHabitsDto {
  categories: {
    categoryId: string;
    habits: string[];
  }[];
}

export interface HabitResponseDto {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  frequencyJson: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface LogResponseDto {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  value: boolean;
  text: string | null;
  createdAt: string;
  updatedAt: string;
}
