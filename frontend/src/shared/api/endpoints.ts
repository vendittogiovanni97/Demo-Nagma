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
    BASE: '/api/finance/transactions',
    SUMMARY: '/api/finance/transactions/summary',
    TRENDS: '/api/finance/transactions/trends',
    PERFORMANCE: '/api/finance/transactions/performance',
    HISTORY: '/api/finance/transactions/history',
    BY_ID: (id: string | number) => `/api/finance/transactions/${id}`,
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
    BASE: '/api/staff/members',
    LIST: '/api/staff/members/list',
    BY_ID: (id: string | number) => `/api/staff/members/${id}`,
  },
  SPESE_LIBERE: {
    BASE: '/api/finance/spese-libere',
    BY_ID: (id: string | number) => `/api/finance/spese-libere/${id}`,
  },
  TEAM: {
    MEMBERS: '/api/staff/members',
    MEMBER_BY_ID: (id: string | number) => `/api/staff/members/${id}`,
    SHIFTS: '/api/staff/shifts',
    SHIFT_BY_ID: (id: string | number) => `/api/staff/shifts/${id}`,
  },
  CREAM: {
    BASE: '/api/cream',
    SALES: '/api/cream/sales',
    SUMMARY: '/api/cream/summary',
  },
  NEW_FEATURE: {
    CONFIG: '/api/newfeature/config',
    BOOKING_PUBLIC: (id: string | number) => `/api/newfeature/booking/${id}`,
    SUBMIT_CONSENT: (id: string | number) => `/api/newfeature/booking/${id}/consent`,
    GET_PLACEMENT: (id: string | number) => `/api/newfeature/booking/${id}/placement`,
    SAVE_PLACEMENT: (id: string | number) => `/api/newfeature/booking/${id}/placement`,
    GET_CONSENTS: '/api/newfeature/consents',
  },
};
