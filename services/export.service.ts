import { api } from '../api/client';

export interface ExportRequest {
  format: 'csv' | 'excel';
  range: 'week' | '1m' | '3m' | 'all';
}

export const exportService = {
  async requestExport(data: ExportRequest): Promise<any> {
    return await api.post('/export', data);
  },
};
