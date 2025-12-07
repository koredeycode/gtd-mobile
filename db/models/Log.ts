import { Model } from '@nozbe/watermelondb'
import { date, field, readonly, relation } from '@nozbe/watermelondb/decorators'

export default class Log extends Model {
  static table = 'logs'
  static associations = {
    habits: { type: 'belongs_to', key: 'habit_id' },
  } as const

  @field('habit_id') habitId!: string
  @field('user_id') userId!: string
  @field('date') date!: string
  @field('value') value!: boolean
  @field('text') text!: string | null

  @readonly @date('created_at') createdAt!: number
  @readonly @date('updated_at') updatedAt!: number

  @relation('habits', 'habit_id') habit!: any
}
