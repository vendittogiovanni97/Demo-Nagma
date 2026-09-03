import { logout } from '@/common/shared/utils/auth';
import { API_BASE_URL, ENDPOINTS } from './endpoints';

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

interface RefreshResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

let isRefreshing = false;
let refreshQueue: Array<(refreshed: boolean) => void> = [];

function notifyRefreshQueue(refreshed: boolean) {
  refreshQueue.forEach(resolve => resolve(refreshed));
  refreshQueue = [];
}

async function attemptTokenRefresh(): Promise<boolean> {
  if (isRefreshing) {
    return new Promise<boolean>(resolve => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      notifyRefreshQueue(false);
      return false;
    }

    await response.json() as RefreshResponse;
    notifyRefreshQueue(true);
    return true;
  } catch {
    notifyRefreshQueue(false);
    return false;
  } finally {
    isRefreshing = false;
  }
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}, isRetry = false): Promise<T> {
  const { params, ...init } = options;

  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        url.searchParams.append(key, String(params[key]));
      }
    });
  }

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...init,
      credentials: 'include',
      headers,
    });
  } catch (error) {
    console.error('Errore di rete/connessione:', error);
    throw new Error('Impossibile connettersi al server. Verifica la tua connessione.');
  }

  if (response.status === 401) {
    const isRefreshEndpoint = endpoint === ENDPOINTS.AUTH.REFRESH;
    const isAuthEndpoint = endpoint === ENDPOINTS.AUTH.LOGIN || endpoint === ENDPOINTS.AUTH.REGISTER;

    // Se stiamo provando a fare login/register, non dobbiamo provare il refresh né sloggare.
    // L'errore verrà gestito dal blocco successivo come normale eccezione.
    if (!isAuthEndpoint) {
      if (!isRetry && !isRefreshEndpoint) {
        const refreshed = await attemptTokenRefresh();

        if (refreshed) {
          return apiFetch<T>(endpoint, options, true);
        }
      }

      logout();
      throw new Error('Sessione scaduta');
    }
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
  post: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) =>
    apiFetch<T>(url, { method: 'DELETE' }),
};

export function createCrudService<T>(basePath: string, byIdPath: (id: string | number) => string) {
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
