import { api } from '../api/client';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
}

export interface DeleteAccountData {
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    return await api.get<UserProfile>('/users/profile');
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    return await api.patch<UserProfile>('/users/profile', data);
  },

  async deleteAccount(data: DeleteAccountData): Promise<void> {
    return await api.delete('/users/profile', data);
  },
};
