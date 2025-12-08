import * as SecureStore from 'expo-secure-store';
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

const PROFILE_CACHE_KEY = 'user_profile';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    // Try to get from cache first
    const cachedProfile = await this.getProfileFromCache();
    if (cachedProfile) {
      // Return cached version but still fetch fresh data in background to update cache
      // generic strategy: return cache immediately, update cache in background? 
      // For now, let's just return cache if it exists to be fast. 
      // Or maybe we want to fetch fresh if cache is missing?
      // The requirement is to avoid redundant API calls.
      return cachedProfile;
    }

    const profile = await api.get<UserProfile>('/users/profile');
    await this.saveProfileToCache(profile);
    return profile;
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const profile = await api.patch<UserProfile>('/users/profile', data);
    await this.saveProfileToCache(profile);
    return profile;
  },

  async deleteAccount(data: DeleteAccountData): Promise<void> {
    await api.delete('/users/profile', data);
    await this.clearProfileCache();
  },

  async saveProfileToCache(profile: UserProfile): Promise<void> {
    try {
      await SecureStore.setItemAsync(PROFILE_CACHE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile to cache:', error);
    }
  },

  async getProfileFromCache(): Promise<UserProfile | null> {
    try {
      const json = await SecureStore.getItemAsync(PROFILE_CACHE_KEY);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      console.error('Error getting profile from cache:', error);
      return null;
    }
  },

  async clearProfileCache(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(PROFILE_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing profile cache:', error);
    }
  }
};
