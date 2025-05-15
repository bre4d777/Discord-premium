/**
 * Simple in-memory cache service
 */
export class CacheService {
    constructor(options) {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.options = options || { enabled: false };
        this.cache = new Map();
    }
    /**
     * Get a value from the cache
     */
    get(key) {
        if (!this.options.enabled)
            return null;
        const item = this.cache.get(key);
        if (!item)
            return null;
        // Check if expired
        if (item.expiry && item.expiry < Date.now()) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }
    /**
     * Set a value in the cache
     */
    set(key, value, ttl) {
        if (!this.options.enabled)
            return;
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
    delete(key) {
        this.cache.delete(key);
    }
    /**
     * Clear the entire cache
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get cache stats
     */
    getStats() {
        return {
            size: this.cache.size,
            enabled: this.options.enabled
        };
    }
}
//# sourceMappingURL=CacheService.js.map