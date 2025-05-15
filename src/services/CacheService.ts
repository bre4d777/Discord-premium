interface CacheOptions {
  enabled: boolean;
  ttl?: number; // Time to live in seconds
  maxSize?: number; // Maximum cache size
}

interface CacheItem<T> {
  value: T;
  expiry: number | null; // Timestamp in ms when this item expires
}

/**
 * Simple in-memory cache service
 */
export class CacheService {
  private cache: Map<string, CacheItem<any>>;
  private options: CacheOptions;

  constructor(options?: CacheOptions) {
    this.options = options || { enabled: false };
    this.cache = new Map();
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    if (!this.options.enabled) return null;

    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    if (!this.options.enabled) return;

    // Handle cache size limit
    if (this.options.maxSize && this.cache.size >= this.options.maxSize) {
      // Simple eviction - remove oldest item
      const iterator = this.cache.keys();
      const oldestKey = iterator.next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    // Calculate expiry
    const expiry = (ttl !== undefined || this.options.ttl !== undefined)
      ? Date.now() + ((ttl !== undefined ? ttl : this.options.ttl || 0) * 1000)
      : null;

    this.cache.set(key, {
      value,
      expiry
    });
  }

  /**
   * Delete a value from the cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number, enabled: boolean } {
    return {
      size: this.cache.size,
      enabled: this.options.enabled
    };
  }
}
