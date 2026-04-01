import Cookies from 'js-cookie';

const TOKEN_KEY = 'nagma_auth_token';

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const logout = () => {
  Cookies.remove(TOKEN_KEY);
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  return !!getToken();
};
