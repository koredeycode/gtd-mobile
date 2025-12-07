import { synchronize } from '@nozbe/watermelondb/sync'
import * as SecureStore from 'expo-secure-store'
import { database } from './index'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1' // Update with actual URL

export async function sync() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      const token = await SecureStore.getItemAsync('access_token');
      
      const response = await fetch(`${API_URL}/sync`, {
        method: 'POST', // The guide says POST for both push and pull in one go?
        // Guide says: POST /api/v1/sync with last_pulled_at and changes.
        // But WatermelonDB separates pull and push.
        // If the backend combines them, we might need a different approach or the backend supports separate params.
        // Re-reading guide: "3. Push & Pull (POST /api/v1/sync)"
        // It seems to imply a single endpoint that DOES BOTH.
        // WatermelonDB `pullChanges` expects return of `{ changes, timestamp }`.
        // If we only pull, we send `last_pulled_at`.
        
        // Let's assume for `pullChanges` we just ask for changes since `lastPulledAt`.
        // If the backend requires a combined call, we might have to hack it, but standard Watermelon Sync is 2 steps.
        // I will implement standard Watermelon Pull.
        
        // Actually, if the backend expects "changes" in the body, it sounds like a "Push first, then Pull" or "Two-way sync in one request". 
        // WatermelonDB supports "Batch execution" but the `synchronize` function is opinionated.
        
        // Let's implement what fits WatermelonDB best:
        // Pull: GET /sync?last_pulled_at=... (or POST with just that)
        // Push: POST /sync with changes.
        
        // However, sticking to the user's guide:
        // payload: { last_pulled_at, changes }
        // valid response: { changes, timestamp }
        
        // If I use the guide's payload for PULL, I send empty changes?
        // "Track changes... changes: ...".
        
        // WatermelonDB `synchronize` runs `pullChanges` first.
        // If I treat the "Push & Pull" as just the synchronization mechanics...
        // Maybe I should just implement `pullChanges` as a fetch with `last_pulled_at`. 
        // And `pushChanges` as a fetch with `changes`.
        
        // I will assume for PULL I define a specific query param or body.
        
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            last_pulled_at: lastPulledAt,
            // We don't send changes in pullChanges
        })
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const { changes, timestamp } = await response.json()
      return { changes, timestamp }
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      const token = await SecureStore.getItemAsync('access_token');

      // The guide says "POST /api/v1/sync" taking "changes".
      const response = await fetch(`${API_URL}/sync`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
             last_pulled_at: lastPulledAt,
             changes 
        })
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }
      
      // The guide says "Process Response... Apply Changes... Update Timestamp".
      // WatermelonDB handles applying changes from Pull. 
      // But Push usually doesn't return changes unless it's a conflict resolution.
      // WatermelonDB expects `pushChanges` to just succeed or fail.
      // If the backend returns "changes" here (e.g. from other devices), WatermelonDB's `pushChanges` doesn't natively consume them to update local DB.
      // `pullChanges` is responsible for getting remote changes.
      
      // So the flow is:
      // 1. Pull (get remote changes since last pull) -> Update Local
      // 2. Push (send local changes) -> Server applies
      
      // If the guide's endpoint does both, we might be missing some updates if we don't process the response of Push. 
      // But `synchronize` is robust. It Pulls, then Pushes. If Push succeeds, we are good. 
      // Any new changes on server will be picked up next Pull.
    },
    // migrationsEnabledAtVersion: 1,
  })
}
