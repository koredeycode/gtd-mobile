import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Define the base URL from environment variables
const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000'; // Fallback for dev

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private async getHeaders(requiresAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requiresAuth) {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Unauthorized, redirect to login
      await SecureStore.deleteItemAsync('access_token');
      router.replace('/auth/login');
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
            const errorBody = await response.json();
             errorMessage = errorBody.message || errorBody.error || `HTTP Error ${response.status}`;
        } catch (e) {
            errorMessage = `HTTP Error ${response.status}`;
        }
      throw new Error(errorMessage);
    }
    
    // Check if the response has content before parsing JSON
    const text = await response.text();
    return text ? JSON.parse(text) : (null as T);
  }

  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...rest } = options;
    const headers = await this.getHeaders(requiresAuth);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
      ...rest,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body: any, options: ApiRequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...rest } = options;
    const headers = await this.getHeaders(requiresAuth);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      ...rest,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body: any, options: ApiRequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...rest } = options;
    const headers = await this.getHeaders(requiresAuth);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      ...rest,
    });

    return this.handleResponse<T>(response);
  }
  
  async patch<T>(endpoint: string, body: any, options: ApiRequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...rest } = options;
    const headers = await this.getHeaders(requiresAuth);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      ...rest,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, body?: any, options: ApiRequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...rest } = options;
    const headers = await this.getHeaders(requiresAuth);

    const requestOptions: RequestInit = {
      method: 'DELETE',
      headers,
      ...rest,
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, requestOptions);

    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient();
