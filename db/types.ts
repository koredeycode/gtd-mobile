import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import * as schema from './schema';

export type Category = InferSelectModel<typeof schema.categories>;
export type NewCategory = InferInsertModel<typeof schema.categories>;

export type Habit = InferSelectModel<typeof schema.habits> & { frequency_json: any; };
export type NewHabit = InferInsertModel<typeof schema.habits>;

export type Log = InferSelectModel<typeof schema.logs>;
export type NewLog = InferInsertModel<typeof schema.logs>;
