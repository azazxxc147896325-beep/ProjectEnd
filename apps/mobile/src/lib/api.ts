import { useAuthStore } from '../stores/auth-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function mobileApi<T = any>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
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

    // หาก Token หมดอายุ (401) ให้ลอง Refresh token อัตโนมัติและลองยิงซ้ำ
    if (response.status === 401 && !isRetry && token) {
      const refreshed = await useAuthStore.getState().refreshTokens();
      if (refreshed) {
        return mobileApi<T>(endpoint, options, true);
      } else {
        useAuthStore.getState().logout();
      }
    }

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      const msg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
      throw new Error(msg || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error: any) {
    console.warn(`[mobileApi] Request failed for ${url}:`, error.message);
    if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
      throw new Error(`ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (${url}) กรุณาตรวจสอบว่าเปิดเซิร์ฟเวอร์ Backend และต่อ Wi-Fi เดียวกัน`);
    }
    throw error;
  }
}
