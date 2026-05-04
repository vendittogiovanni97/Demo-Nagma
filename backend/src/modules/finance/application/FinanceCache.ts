import { Cache } from '../../../shared/utils/cache';

/**
 * Finance Cache Service
 * Stores summaries and trends to reduce DB load
 * TTL: 1 minute (finances change often but not constantly)
 */
export class FinanceCache {
  private static instance: FinanceCache;
  private cache: Cache<any>;

  private constructor() {
    this.cache = new Cache(60 * 1000); // 1 minute
  }

  public static getInstance(): FinanceCache {
    if (!FinanceCache.instance) {
      FinanceCache.instance = new FinanceCache();
    }
    return FinanceCache.instance;
  }

  get(key: string): any | null {
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  invalidate(): void {
    this.cache.clear();
  }
}

export const financeCache = FinanceCache.getInstance();
