import { api } from '../api/client';

export interface SyncPayload {
  last_pulled_at: number;
  changes: {
    habits: {
      created: any[];
      updated: any[];
      deleted: string[];
    };
    logs: {
      created: any[];
      updated: any[];
      deleted: string[];
    };
  };
}

export interface SyncResponse {
  changes: {
    habits: {
      created: any[];
      updated: any[];
      deleted: string[];
    };
    logs: {
      created: any[];
      updated: any[];
      deleted: string[];
    };
  };
  timestamp: number;
}

export const syncService = {
  async syncData(payload: SyncPayload): Promise<SyncResponse> {
    return await api.post<SyncResponse>('/api/v1/sync', payload);
  },
};
