export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_archived: boolean;
  created_at: number;
  updated_at: number;
}

export interface Habit {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  frequency: string;
  type: string;
  goal_id: string | null;
  is_archived: boolean;
  created_at: number;
  updated_at: number;
}

export interface Log {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  value: boolean;
  text: string | null;
  created_at: number;
  updated_at: number;
}
