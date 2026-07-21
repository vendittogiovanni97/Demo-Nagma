import { API_BASE_URL, ENDPOINTS } from '@/common/shared/api/endpoints';
import { getToken } from '@/common/shared/utils/auth';

export interface EndpointMetric {
  method: string;
  path: string;
  count: number;
  avgDurationMs: number;
  p95DurationMs: number;
  errorRatePercent: number;
}

export interface RequestLogEntry {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  userId?: number;
}

export interface CoreWebVitalsData {
  fcp?: number;
  lcp?: number;
  cls?: number;
  ttfb?: number;
  fid?: number;
  updatedAt?: string;
}

export interface SystemHealthData {
  dbStatus: 'ONLINE' | 'OFFLINE';
  dbLatencyMs: number;
  storageUsedBytes: number;
  storageFormatted: string;
  storagePercent: number;
}

export interface MetricsSummaryData {
  totalRequests: number;
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  errorRatePercent: number;
  slowRequestsCount: number;
  endpoints: EndpointMetric[];
  slowRequests: RequestLogEntry[];
  webVitals: CoreWebVitalsData;
  health?: SystemHealthData;
}

export const metricsApi = {
  getSummary: async (): Promise<MetricsSummaryData> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.METRICS.SUMMARY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Impossibile recuperare le metriche di prestazione');
    }

    return response.json();
  },

  recordVitals: async (vitals: Partial<CoreWebVitalsData>): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}${ENDPOINTS.METRICS.VITALS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitals),
      });
    } catch {}
  },

  resetMetrics: async (): Promise<void> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.METRICS.RESET}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Impossibile azzerare le metriche');
    }
  },
};
