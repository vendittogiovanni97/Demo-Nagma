export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
  },
  CUSTOMERS: {
    BASE: '/api/customers',
    BY_ID: (id: string | number) => `/api/customers/${id}`,
    SUMMARY: (id: string | number) => `/api/customers/${id}/summary`,
  },
  BOOKINGS: {
    BASE: '/api/bookings',
    STATS: '/api/bookings/stats',
    BY_ID: (id: string | number) => `/api/bookings/${id}`,
    HISTORY: (id: string | number) => `/api/bookings/${id}/history`,
  },
  ADMIN: {
    BOOKING_HISTORY: '/api/bookings/history',
  },
  TRANSACTIONS: {
    BASE: '/api/transactions',
    SUMMARY: '/api/transactions/summary',
    TRENDS: '/api/transactions/trends',
    PERFORMANCE: '/api/transactions/performance',
    BY_ID: (id: string | number) => `/api/transactions/${id}`,
  },
  FORM_TEMPLATES: {
    BASE: '/api/form-templates',
    BY_ID: (id: string | number) => `/api/form-templates/${id}`,
  },
  WHATSAPP: {
    BASE: '/api/whatsapp-templates',
    LOGS: '/api/whatsapp-templates/logs',
    SEND: '/api/whatsapp-templates/send',
    DUPLICATE: (id: string | number) => `/api/whatsapp-templates/${id}/duplicate`,
    BY_ID: (id: string | number) => `/api/whatsapp-templates/${id}`,
  },
  STAFF: {
    BASE: '/api/team/members',
    LIST: '/api/team/members/list',
    BY_ID: (id: string | number) => `/api/team/members/${id}`,
  },
  SPESE_LIBERE: {
    BASE: '/api/spese-libere',
    BY_ID: (id: string | number) => `/api/spese-libere/${id}`,
  },
  TEAM: {
    MEMBERS: '/api/team/members',
    MEMBER_BY_ID: (id: string | number) => `/api/team/members/${id}`,
    SHIFTS: '/api/team/shifts',
    SHIFT_BY_ID: (id: string | number) => `/api/team/shifts/${id}`,
  },
  CREAM: {
    BASE: '/api/cream',
    SALES: '/api/cream/sales',
    SUMMARY: '/api/cream/summary',
  },
};
