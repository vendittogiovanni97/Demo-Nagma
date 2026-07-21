import prisma from '../../../core/shared/utils/prisma';
import {
  RequestLogEntry,
  EndpointMetricDto,
  CoreWebVitalsDto,
  MetricsSummaryDto,
  SystemHealthDto,
} from '../types/metrics.types';

export class MetricsService {
  private requests: RequestLogEntry[] = [];
  private maxRequestsToKeep = 2000;
  private webVitalsData: CoreWebVitalsDto = {};

  recordRequest(method: string, path: string, statusCode: number, durationMs: number, userId?: number): void {
    const entry: RequestLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      method,
      path,
      statusCode,
      durationMs,
      timestamp: new Date().toISOString(),
      userId,
    };

    this.requests.push(entry);
    if (this.requests.length > this.maxRequestsToKeep) {
      this.requests.shift();
    }
  }

  recordWebVitals(vitals: Partial<CoreWebVitalsDto>): void {
    this.webVitalsData = {
      ...this.webVitalsData,
      ...vitals,
      updatedAt: new Date().toISOString(),
    };
  }

  async getMetricsSummary(): Promise<MetricsSummaryDto> {
    let storageUsedBytes = 0;
    let dbLatencyMs = 4;
    let dbStatus: 'ONLINE' | 'OFFLINE' = 'ONLINE';

    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Math.max(1, Date.now() - start);

      const agg = await prisma.attachment.aggregate({
        _sum: { fileSize: true },
        where: { deletedAt: null },
      });
      storageUsedBytes = agg._sum.fileSize || 0;
    } catch {
      dbStatus = 'OFFLINE';
    }

    const totalCapacityBytes = 10 * 1024 * 1024 * 1024; // 10 GB
    const storagePercent = Number(((storageUsedBytes / totalCapacityBytes) * 100).toFixed(2));
    const storageMB = (storageUsedBytes / (1024 * 1024)).toFixed(2);
    const storageFormatted = storageUsedBytes > 1024 * 1024 * 1024 
      ? `${(storageUsedBytes / (1024 * 1024 * 1024)).toFixed(2)} GB` 
      : `${storageMB} MB`;

    const health: SystemHealthDto = {
      dbStatus,
      dbLatencyMs,
      storageUsedBytes,
      storageFormatted,
      storagePercent,
    };

    const totalRequests = this.requests.length;
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        avgResponseTimeMs: 0,
        p95ResponseTimeMs: 0,
        p99ResponseTimeMs: 0,
        errorRatePercent: 0,
        slowRequestsCount: 0,
        endpoints: [],
        slowRequests: [],
        webVitals: this.webVitalsData,
        health,
      };
    }

    const durations = this.requests.map((r) => r.durationMs).sort((a, b) => a - b);
    const sumDuration = durations.reduce((acc, curr) => acc + curr, 0);
    const avgResponseTimeMs = Math.round(sumDuration / totalRequests);

    const p95Idx = Math.floor(durations.length * 0.95);
    const p99Idx = Math.floor(durations.length * 0.99);
    const p95ResponseTimeMs = durations[p95Idx] || durations[durations.length - 1];
    const p99ResponseTimeMs = durations[p99Idx] || durations[durations.length - 1];

    const errorRequests = this.requests.filter((r) => r.statusCode >= 400).length;
    const errorRatePercent = Number(((errorRequests / totalRequests) * 100).toFixed(1));

    const slowRequests = this.requests.filter((r) => r.durationMs >= 100).slice(-50).reverse();
    const slowRequestsCount = this.requests.filter((r) => r.durationMs >= 100).length;

    // Aggregate by endpoint
    const endpointMap = new Map<string, { method: string; path: string; durations: number[]; errors: number }>();
    this.requests.forEach((r) => {
      // Group routes by path base (e.g. /api/bookings)
      const pathBase = r.path.split('?')[0];
      const key = `${r.method}:${pathBase}`;
      if (!endpointMap.has(key)) {
        endpointMap.set(key, { method: r.method, path: pathBase, durations: [], errors: 0 });
      }
      const item = endpointMap.get(key)!;
      item.durations.push(r.durationMs);
      if (r.statusCode >= 400) item.errors++;
    });

    const endpoints: EndpointMetricDto[] = Array.from(endpointMap.values()).map((item) => {
      const sortedDurations = [...item.durations].sort((a, b) => a - b);
      const avg = Math.round(sortedDurations.reduce((a, b) => a + b, 0) / sortedDurations.length);
      const p95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)] || sortedDurations[sortedDurations.length - 1];
      const errRate = Number(((item.errors / sortedDurations.length) * 100).toFixed(1));

      return {
        method: item.method,
        path: item.path,
        count: sortedDurations.length,
        avgDurationMs: avg,
        p95DurationMs: p95,
        errorRatePercent: errRate,
      };
    }).sort((a, b) => b.avgDurationMs - a.avgDurationMs).slice(0, 15);

    return {
      totalRequests,
      avgResponseTimeMs,
      p95ResponseTimeMs,
      p99ResponseTimeMs,
      errorRatePercent,
      slowRequestsCount,
      endpoints,
      slowRequests,
      webVitals: this.webVitalsData,
      health,
    };
  }

  resetMetrics(): void {
    this.requests = [];
    this.webVitalsData = {};
  }
}
