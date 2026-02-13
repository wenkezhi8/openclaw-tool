import { logger } from '../logger';
import type { CacheEntry, CacheStats, CacheConfig } from '../../types/cache';

// Default configuration
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 1000,
  defaultTTL: 60000, // 1 minute
  cleanupInterval: 300000, // 5 minutes
};

class CacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;
  private hits = 0;
  private misses = 0;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanup();
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    entry.hits++;
    this.hits++;
    return entry.value as T;
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Check if we need to evict
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      hits: 0,
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete a value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let totalSize = 0;

    this.cache.forEach((entry) => {
      // Approximate size calculation
      totalSize += JSON.stringify(entry.value).length;
    });

    const totalRequests = this.hits + this.misses;

    return {
      totalEntries: this.cache.size,
      totalHits: this.hits,
      totalMisses: this.misses,
      hitRate: totalRequests > 0 ? this.hits / totalRequests : 0,
      totalSize,
    };
  }

  /**
   * Get or set a value (compute if missing)
   */
  async getOrSet<T>(key: string, compute: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await compute();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Invalidate entries matching a pattern
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let deleted = 0;

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    });

    if (deleted > 0) {
      logger.debug(`Invalidated ${deleted} cache entries matching pattern: ${pattern}`);
    }

    return deleted;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart cleanup with new interval
    if (config.cleanupInterval) {
      this.stopCleanup();
      this.startCleanup();
    }
  }

  /**
   * Shutdown cache service
   */
  shutdown(): void {
    this.stopCleanup();
    this.clear();
  }

  // Private methods

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.createdAt > entry.ttl;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug(`Evicted oldest cache entry: ${oldestKey}`);
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private cleanup(): void {
    let cleaned = 0;

    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      logger.debug(`Cleaned up ${cleaned} expired cache entries`);
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export class for testing
export { CacheService };
