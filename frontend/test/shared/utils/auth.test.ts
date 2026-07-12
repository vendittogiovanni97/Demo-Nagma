import * as auth from '@/common/shared/utils/auth';

const cookieStore: Record<string, string> = {};

jest.mock('js-cookie', () => ({
  set: jest.fn((key: string, value: string) => { cookieStore[key] = value; }),
  get: jest.fn((key: string) => cookieStore[key] ?? undefined),
  remove: jest.fn((key: string) => { delete cookieStore[key]; }),
}));

describe('auth utils', () => {
  beforeEach(() => {
    Object.keys(cookieStore).forEach(k => delete cookieStore[k]);

    Object.defineProperty(window, 'localStorage', {
      value: (() => {
        let store: Record<string, string> = {};
        return {
          getItem: (key: string) => store[key] ?? null,
          setItem: (key: string, value: string) => { store[key] = value; },
          removeItem: (key: string) => { delete store[key]; },
          clear: () => { store = {}; },
        };
      })(),
      writable: true,
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      expect(auth.isAuthenticated()).toBe(false);
    });

    it('should return true when token exists', () => {
      auth.setToken('test-token');
      expect(auth.isAuthenticated()).toBe(true);
    });
  });

  describe('setToken / getToken', () => {
    it('should set and get token from cookie', () => {
      auth.setToken('my-token');
      expect(auth.getToken()).toBe('my-token');
    });

    it('should return undefined when no cookie', () => {
      expect(auth.getToken()).toBeUndefined();
    });
  });

  describe('setUser / getUser', () => {
    it('should set and get user from localStorage', () => {
      const user = { id: 1, name: 'Mario' };
      auth.setUser(user);
      expect(auth.getUser()).toEqual(user);
    });

    it('should return null when no user in localStorage', () => {
      expect(auth.getUser()).toBeNull();
    });

    it('should return null for corrupted JSON', () => {
      window.localStorage.setItem('nagma_auth_user', 'not-json');
      expect(auth.getUser()).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should remove token and user', () => {
      auth.setToken('t');
      auth.setUser({ id: 1 });
      auth.clearSession();
      expect(auth.getToken()).toBeUndefined();
      expect(auth.getUser()).toBeNull();
    });
  });
});
