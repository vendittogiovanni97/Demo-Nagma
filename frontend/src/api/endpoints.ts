export const API_BASE_URL = 'http://localhost:3001';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
  CUSTOMERS: {
    BASE: '/api/customers',
    BY_ID: (id: string) => `/api/customers/${id}`,
  },
  BOOKINGS: {
    BASE: '/api/bookings',
    STATS: '/api/bookings/stats',
    BY_ID: (id: string) => `/api/bookings/${id}`,
  },
  TRANSACTIONS: {
    BASE: '/api/transactions',
    SUMMARY: '/api/transactions/summary',
    TRENDS: '/api/transactions/trends',
    PERFORMANCE: '/api/transactions/performance',
    BY_ID: (id: string) => `/api/transactions/${id}`,
  },
  CREAMS: {
    BASE: '/api/creams',
    SALES: '/api/creams/sales',
    BY_ID: (id: string) => `/api/creams/${id}`,
  },
  TEAM: {
    USERS: '/api/team/users',
    SHIFTS: '/api/team/shifts',
    SHIFT_BY_ID: (id: string) => `/api/team/shifts/${id}`,
  },
};
