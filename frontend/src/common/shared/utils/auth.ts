const USER_KEY = 'nagma_auth_user';

export const setUser = (user: unknown) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearSession = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(USER_KEY);
  }
};

export const logout = () => {
  clearSession();
  window.location.href = '/login';
};
