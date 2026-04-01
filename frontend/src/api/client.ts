import { getToken, logout } from '@/utils/auth';
import { API_BASE_URL } from './endpoints';

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | undefined>;
};

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;
  
  // Build URL with query parameters
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        url.searchParams.append(key, String(params[key]));
      }
    });
  }

  const token = getToken();
  
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers,
  });

  if (response.status === 401) {
    logout();
    throw new Error('Sessione scaduta');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Errore ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) return {} as T;

  return response.json();
}

export const apiClient = {
  get: <T>(url: string, params?: Record<string, string | number | undefined>) => 
    apiFetch<T>(url, { method: 'GET', params }),
  post: <T>(url: string, body: any) => 
    apiFetch<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: any) => 
    apiFetch<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) => 
    apiFetch<T>(url, { method: 'DELETE' }),
};
