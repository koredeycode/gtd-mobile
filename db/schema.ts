import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'habits',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'category_id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'frequency_json', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'logs',
      columns: [
        { name: 'habit_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string' },
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'value', type: 'boolean' },
        { name: 'text', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
})
