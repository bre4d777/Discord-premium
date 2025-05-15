interface CacheOptions {
    enabled: boolean;
    ttl?: number;
    maxSize?: number;
}
/**
 * Simple in-memory cache service
 */
export declare class CacheService {
    private cache;
    private options;
    constructor(options?: CacheOptions);
    /**
     * Get a value from the cache
     */
    get<T>(key: string): T | null;
    /**
     * Set a value in the cache
     */
    set<T>(key: string, value: T, ttl?: number): void;
    /**
     * Delete a value from the cache
     */
    delete(key: string): void;
    /**
     * Clear the entire cache
     */
    clear(): void;
    /**
     * Get cache stats
     */
    getStats(): {
        size: number;
        enabled: boolean;
    };
}
export {};
//# sourceMappingURL=CacheService.d.ts.map