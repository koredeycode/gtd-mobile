import { api } from '../api/client';

export const feedbackService = {
  async submitFeedback(message: string): Promise<any> {
    return await api.post('/feedback', { message });
  },
};
