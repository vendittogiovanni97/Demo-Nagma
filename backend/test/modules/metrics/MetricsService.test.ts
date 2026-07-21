import { MetricsService } from '../../../src/modules/metrics/services/metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  it('should return empty summary when no requests are logged', () => {
    const summary = service.getMetricsSummary();
    expect(summary.totalRequests).toBe(0);
    expect(summary.avgResponseTimeMs).toBe(0);
    expect(summary.endpoints).toHaveLength(0);
  });

  it('should record HTTP requests and calculate response time percentiles', () => {
    service.recordRequest('GET', '/api/customers', 200, 50, 1);
    service.recordRequest('POST', '/api/bookings', 201, 150, 1);
    service.recordRequest('GET', '/api/customers', 500, 300, 1);

    const summary = service.getMetricsSummary();
    expect(summary.totalRequests).toBe(3);
    expect(summary.avgResponseTimeMs).toBe(167); // (50+150+300)/3
    expect(summary.errorRatePercent).toBe(33.3);
    expect(summary.slowRequestsCount).toBe(2); // >= 100ms
  });

  it('should record Web Vitals correctly', () => {
    service.recordWebVitals({ fcp: 1200, lcp: 2100, cls: 0.05, ttfb: 450 });

    const summary = service.getMetricsSummary();
    expect(summary.webVitals.fcp).toBe(1200);
    expect(summary.webVitals.lcp).toBe(2100);
    expect(summary.webVitals.cls).toBe(0.05);
    expect(summary.webVitals.ttfb).toBe(450);
  });

  it('should reset metrics buffer when resetMetrics is called', () => {
    service.recordRequest('GET', '/api/customers', 200, 50, 1);
    service.recordWebVitals({ fcp: 1200 });
    service.resetMetrics();

    const summary = service.getMetricsSummary();
    expect(summary.totalRequests).toBe(0);
    expect(summary.webVitals.fcp).toBeUndefined();
  });
});
