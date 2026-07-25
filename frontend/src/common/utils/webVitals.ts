import { metricsApi } from '@/common/shared/api/metrics.api';

export function initWebVitalsTracking(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const vitals: { fcp?: number; lcp?: number; cls?: number; ttfb?: number } = {};

  try {
    // Navigation timing (TTFB)
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      vitals.ttfb = Math.round(navEntries[0].responseStart);
    }

    // Paint timing (FCP)
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          vitals.fcp = Math.round(entry.startTime);
          metricsApi.recordVitals(vitals);
        }
      }
    });
    paintObserver.observe({ type: 'paint', buffered: true });

    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        vitals.lcp = Math.round(lastEntry.startTime);
        metricsApi.recordVitals(vitals);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          vitals.cls = Number(clsValue.toFixed(3));
          metricsApi.recordVitals(vitals);
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Send initial TTFB
    if (vitals.ttfb) {
      metricsApi.recordVitals(vitals);
    }
  } catch {}
}
