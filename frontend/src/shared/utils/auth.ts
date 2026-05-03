import Cookies from 'js-cookie';

const TOKEN_KEY = 'nagma_auth_token';
const USER_KEY = 'nagma_auth_user';

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

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
  Cookies.remove(TOKEN_KEY);
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(USER_KEY);
  }
};

export const logout = () => {
  clearSession();
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  return !!getToken();
};
