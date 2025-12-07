import { api } from '../api/client';

export interface RadarData {
  labels: string[];
  data: number[];
}

export const analyticsService = {
  async getRadarData(range: 'week' | '1m' | '3m' = 'week'): Promise<RadarData> {
    return await api.get<RadarData>(`/analytics/radar?range=${range}`);
  },
};
