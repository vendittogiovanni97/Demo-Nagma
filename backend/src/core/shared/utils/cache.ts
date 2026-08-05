/**
 * In-memory cache with TTL support and automatic cleanup
 * 
 * FIX #2: Periodic cleanup prevents memory leaks from expired entries
 * that are never accessed again. Runs cleanup every 10 minutes to remove
 * stale entries and keep memory usage stable.
 */

import { logger } from './logger';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private ttl: number; // milliseconds
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private cleanupIntervalMs: number; // milliseconds

  /**
   * Initialize cache with TTL and cleanup interval
   * @param ttl - Time to live for cache entries (default: 5 minutes)
   * @param cleanupIntervalMs - How often to cleanup expired entries (default: 10 minutes)
   */
  constructor(ttl: number = 5 * 60 * 1000, cleanupIntervalMs: number = 10 * 60 * 1000) {
    this.ttl = ttl;
    this.cleanupIntervalMs = cleanupIntervalMs;
    this.startCleanup();
  }

  /**
   * Start periodic cleanup timer
   * Cleanup runs every 10 minutes and removes all expired entries
   * Uses unref() to prevent keeping Node process alive
   */
  private startCleanup(): void {
    // Avoid keeping Node process alive just for cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.cleanupIntervalMs);

    // Mark interval as not blocking process shutdown
    // This allows the app to exit cleanly even if cleanup is pending
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Run cleanup: remove all expired entries from cache
   * Called automatically every 10 minutes
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // Find all expired entries
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }

    // Remove expired entries in batch
    expiredKeys.forEach(key => this.store.delete(key));

    // Log cleanup activity (debug level to avoid noise in production)
    if (expiredKeys.length > 0) {
      logger.debug(`[Cache] Cleanup removed ${expiredKeys.length} expired entries (store size now: ${this.store.size})`);
    }
  }

  /**
   * Set a value in cache
   */
  set(key: string, value: T): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
    });
  }

  /**
   * Get a value from cache (returns null if expired or not found)
   * On-access expiration check: if expired, delete immediately
   */
  get(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get current cache size (number of entries)
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Destroy cache and cleanup resources
   * MUST be called during app shutdown to avoid memory leaks
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
    logger.debug('[Cache] Cache destroyed and resources cleaned up');
  }
}
