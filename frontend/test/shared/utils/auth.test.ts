import * as auth from '@/common/shared/utils/auth';

describe('auth utils', () => {
  beforeEach(() => {
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
    it('should remove user from localStorage', () => {
      auth.setUser({ id: 1 });
      auth.clearSession();
      expect(auth.getUser()).toBeNull();
    });
  });
});
