// Cache Types

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  createdAt: number;
  ttl: number; // Time to live in milliseconds
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  totalSize: number; // Approximate size in bytes
}

export interface CacheConfig {
  maxSize: number; // Maximum number of entries
  defaultTTL: number; // Default TTL in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
}
