import { getToken, logout } from '@/utils/auth';
import { API_BASE_URL } from './endpoints';

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | undefined>;
};

interface ApiErrorResponse {
  message?: string;
  error?: {
    code?: string;
    statusCode?: number;
    details?: unknown;
  };
}

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
    const errorData = await response.json().catch<ApiErrorResponse>(() => ({}));
    throw new Error(errorData.message || `Errore ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) return {} as T;

  return response.json();
}

export const apiClient = {
  get: <T>(url: string, params?: Record<string, string | number | undefined>) =>
    apiFetch<T>(url, { method: 'GET', params }),
  post: <T>(url: string, body: unknown) =>
    apiFetch<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) =>
    apiFetch<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) =>
    apiFetch<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string) =>
    apiFetch<T>(url, { method: 'DELETE' }),
};

/**
 * Factory per creare un service CRUD base.
 * Evita di riscrivere getAll/getById/create/update/delete per ogni entità.
 */
export function createCrudService<T>(basePath: string, byIdPath: (id: any) => string) {
  return {
    getAll: (params?: Record<string, string | number | undefined>) =>
      apiClient.get<T[]>(basePath, params),
    getById: (id: string | number) =>
      apiClient.get<T>(byIdPath(id)),
    create: <D = unknown>(data: D) =>
      apiClient.post<T>(basePath, data),
    update: <D = unknown>(id: string | number, data: D) =>
      apiClient.put<T>(byIdPath(id), data),
    delete: (id: string | number) =>
      apiClient.delete(byIdPath(id)),
  };
}
