import { Model } from '@nozbe/watermelondb'
import { children, date, field, readonly, relation } from '@nozbe/watermelondb/decorators'

export default class Habit extends Model {
  static table = 'habits'
  static associations = {
    logs: { type: 'has_many', foreignKey: 'habit_id' },
    categories: { type: 'belongs_to', key: 'category_id' },
  } as const

  @field('user_id') userId!: string
  @field('category_id') categoryId!: string
  @field('title') title!: string
  @field('frequency_json') frequencyJson!: string

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number

  @children('logs') logs!: any
  @relation('categories', 'category_id') category!: any

  get frequency() {
    return JSON.parse(this.frequencyJson)
  }
}
