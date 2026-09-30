import { apiClient, createCrudService } from '@/common/shared/api/client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('@/common/shared/utils/auth', () => ({
  getToken: jest.fn(),
  logout: jest.fn(),
}));

import { getToken, logout } from '@/common/shared/utils/auth';

const mockedGetToken = getToken as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('apiClient', () => {
  it('should make GET request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, name: 'test' }),
    });

    const result = await apiClient.get('/api/test', { page: '1' });

    expect(result).toEqual({ id: 1, name: 'test' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test?page=1'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should make POST request with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: 1 }),
    });

    const result = await apiClient.post('/api/test', { name: 'new' });

    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'new' }),
      })
    );
  });

  it('should include credentials for httpOnly cookies', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiClient.get('/api/test');

    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.credentials).toBe('include');
  });

  it('should throw on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Something went wrong' }),
    });

    await expect(apiClient.get('/api/test')).rejects.toThrow('Something went wrong');
  });

  it('should throw fallback error when no message in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });

    await expect(apiClient.get('/api/test')).rejects.toThrow('Errore 500: Internal Server Error');
  });

  it('should return empty object for 204', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => { throw new Error('no body'); },
    });

    const result = await apiClient.delete('/api/test/1');
    expect(result).toEqual({});
  });

  it('should auto-refresh on 401 and retry', async () => {
    mockedGetToken.mockReturnValue('legacy-token');

    const refreshResponse = {
      ok: true,
      json: async () => ({ user: { id: 1, name: 'Mario', email: 'm@t.it', role: 'ADMIN' } }),
    };

    const successResponse = {
      ok: true,
      status: 200,
      json: async () => ({ data: 'success' }),
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      })
      .mockResolvedValueOnce(refreshResponse)
      .mockResolvedValueOnce(successResponse);

    const result = await apiClient.get('/api/protected');

    expect(result).toEqual({ data: 'success' });
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/auth/refresh'),
      expect.objectContaining({ credentials: 'include', method: 'POST' })
    );
  });

  it('should logout on failed refresh', async () => {
    mockedGetToken.mockReturnValue('expired-token');

    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      });

    await expect(apiClient.get('/api/protected')).rejects.toThrow('Sessione scaduta');
    expect(logout).toHaveBeenCalledTimes(1);
  });
});

describe('createCrudService', () => {
  it('should create CRUD methods', () => {
    const service = createCrudService('/api/items', (id) => `/api/items/${id}`);

    expect(service).toHaveProperty('getAll');
    expect(service).toHaveProperty('getById');
    expect(service).toHaveProperty('create');
    expect(service).toHaveProperty('update');
    expect(service).toHaveProperty('delete');
  });

  it('getAll should call apiClient.get with base path', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ id: 1 }],
    });

    const service = createCrudService('/api/items', (id) => `/api/items/${id}`);
    const result = await service.getAll({ page: '1' });

    expect(result).toEqual([{ id: 1 }]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/items?page=1'),
      expect.any(Object)
    );
  });

  it('getById should call apiClient.get with id path', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 5 }),
    });

    const service = createCrudService('/api/items', (id) => `/api/items/${id}`);
    const result = await service.getById(5);

    expect(result).toEqual({ id: 5 });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/items/5'),
      expect.any(Object)
    );
  });
});
