import { apiClient } from '@/common/shared/api/client';
import { ENDPOINTS } from '@/common/shared/api/endpoints';

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
  getSummary: () =>
    apiClient.get<MetricsSummaryData>(ENDPOINTS.METRICS.SUMMARY),

  recordVitals: async (vitals: Partial<CoreWebVitalsData>): Promise<void> => {
    try {
      await apiClient.post<void>(ENDPOINTS.METRICS.VITALS, vitals);
    } catch {}
  },

  resetMetrics: () =>
    apiClient.delete<void>(ENDPOINTS.METRICS.RESET),
};
