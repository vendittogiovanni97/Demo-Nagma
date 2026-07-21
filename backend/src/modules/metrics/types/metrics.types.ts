export interface RequestLogEntry {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  userId?: number;
}

export interface EndpointMetricDto {
  method: string;
  path: string;
  count: number;
  avgDurationMs: number;
  p95DurationMs: number;
  errorRatePercent: number;
}

export interface CoreWebVitalsDto {
  fcp?: number;
  lcp?: number;
  cls?: number;
  ttfb?: number;
  fid?: number;
  updatedAt?: string;
}

export interface SystemHealthDto {
  dbStatus: 'ONLINE' | 'OFFLINE';
  dbLatencyMs: number;
  storageUsedBytes: number;
  storageFormatted: string;
  storagePercent: number;
}

export interface MetricsSummaryDto {
  totalRequests: number;
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  errorRatePercent: number;
  slowRequestsCount: number;
  endpoints: EndpointMetricDto[];
  slowRequests: RequestLogEntry[];
  webVitals: CoreWebVitalsDto;
  health?: SystemHealthDto;
}
