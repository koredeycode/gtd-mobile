import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data, { requiresAuth: false });
    await this.handleAuthResponse(response);
    return response;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data, { requiresAuth: false });
    await this.handleAuthResponse(response);
    return response;
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('user_id');
  },

  async handleAuthResponse(response: AuthResponse): Promise<void> {
    if (response.access_token) {
      await SecureStore.setItemAsync('access_token', response.access_token);
    }
    if (response.user && response.user.id) {
      await SecureStore.setItemAsync('user_id', response.user.id);
    }
  },
  
  async getToken(): Promise<string | null> {
      return await SecureStore.getItemAsync('access_token');
  },

  async getUserId(): Promise<string | null> {
      return await SecureStore.getItemAsync('user_id');
  }
};
