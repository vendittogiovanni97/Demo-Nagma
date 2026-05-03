import { getToken, logout, setToken } from '@/shared/utils/auth';
import { API_BASE_URL, ENDPOINTS } from '@/shared/api/endpoints';

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
  token: string;
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function notifyRefreshQueue(token: string | null) {
  refreshQueue.forEach(resolve => resolve(token));
  refreshQueue = [];
}

async function attemptTokenRefresh(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise<string | null>(resolve => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const currentToken = getToken();
    if (!currentToken) {
      notifyRefreshQueue(null);
      return null;
    }

    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) {
      notifyRefreshQueue(null);
      return null;
    }

    const data = (await response.json()) as RefreshResponse;
    setToken(data.token);
    notifyRefreshQueue(data.token);
    return data.token;
  } catch {
    notifyRefreshQueue(null);
    return null;
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
    const isRefreshEndpoint = endpoint === ENDPOINTS.AUTH.REFRESH;
    const isAuthEndpoint = endpoint === ENDPOINTS.AUTH.LOGIN || endpoint === ENDPOINTS.AUTH.REGISTER;

    if (!isAuthEndpoint) {
      if (!isRetry && !isRefreshEndpoint) {
        const newToken = await attemptTokenRefresh();
        if (newToken) {
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

export const httpClient = {
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
