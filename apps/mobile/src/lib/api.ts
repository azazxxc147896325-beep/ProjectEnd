import { useAuthStore } from '../stores/auth-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function mobileApi<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error: any) {
    console.warn(`[mobileApi] Request failed for ${url}:`, error.message);
    throw error;
  }
}
