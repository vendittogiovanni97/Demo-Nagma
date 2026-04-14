export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  CUSTOMERS: {
    BASE: '/api/customers',
    BY_ID: (id: string) => `/api/customers/${id}`,
    SUMMARY: (id: string) => `/api/customers/${id}/summary`,
  },
  BOOKINGS: {
    BASE: '/api/bookings',
    STATS: '/api/bookings/stats',
    BY_ID: (id: string) => `/api/bookings/${id}`,
    HISTORY: (id: string) => `/api/bookings/${id}/history`,
  },
  TRANSACTIONS: {
    BASE: '/api/transactions',
    SUMMARY: '/api/transactions/summary',
    TRENDS: '/api/transactions/trends',
    PERFORMANCE: '/api/transactions/performance',
    BY_ID: (id: string) => `/api/transactions/${id}`,
  },
  FORM_TEMPLATES: {
    BASE: '/api/form-templates',
    BY_ID: (id: string) => `/api/form-templates/${id}`,
  },
  WHATSAPP: {
    BASE: '/api/whatsapp-templates',
    LOGS: '/api/whatsapp-templates/logs',
    SEND: '/api/whatsapp-templates/send',
    DUPLICATE: (id: string) => `/api/whatsapp-templates/${id}/duplicate`,
    BY_ID: (id: string) => `/api/whatsapp-templates/${id}`,
  },
  STAFF: {
    BASE: '/api/staff',
    BY_ID: (id: string) => `/api/staff/${id}`,
  },
  TEAM: {
    USERS: '/api/team/users',
    USER_BY_ID: (id: string) => `/api/team/users/${id}`,
    SHIFTS: '/api/team/shifts',
    SHIFT_BY_ID: (id: string) => `/api/team/shifts/${id}`,
  },
};
