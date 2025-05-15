export class UserService {
    constructor(driver, cache) {
        Object.defineProperty(this, "driver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.driver = driver;
        this.cache = cache;
    }
    async getUser(userId) {
        const cacheKey = `user:${userId}`;
        // Try to get from cache first
        const cachedUser = this.cache.get(cacheKey);
        if (cachedUser)
            return cachedUser;
        // Get from database
        const user = await this.driver.getUser(userId);
        // Store in cache if found
        if (user) {
            this.cache.set(cacheKey, user);
        }
        return user;
    }
    async setUser(userId, data) {
        await this.driver.setUser(userId, data);
        // Update cache
        const cacheKey = `user:${userId}`;
        this.cache.set(cacheKey, data);
        // Invalidate related caches
        this.cache.delete(`users:tier:${data.tier}`);
        this.cache.delete('users:all');
        this.cache.delete('users:expired');
    }
    async removeUser(userId) {
        // Get user first to invalidate tier-based cache
        const user = await this.getUser(userId);
        await this.driver.removeUser(userId);
        // Invalidate caches
        const cacheKey = `user:${userId}`;
        this.cache.delete(cacheKey);
        if (user) {
            this.cache.delete(`users:tier:${user.tier}`);
        }
        this.cache.delete('users:all');
        this.cache.delete('users:expired');
    }
    async getAllUsers() {
        const cacheKey = 'users:all';
        // Try to get from cache first
        const cachedUsers = this.cache.get(cacheKey);
        if (cachedUsers)
            return cachedUsers;
        // Get from database
        const users = await this.driver.getAllUsers();
        // Store in cache
        this.cache.set(cacheKey, users);
        return users;
    }
    async getUsersByTier(tier) {
        const cacheKey = `users:tier:${tier}`;
        // Try to get from cache first
        const cachedUsers = this.cache.get(cacheKey);
        if (cachedUsers)
            return cachedUsers;
        // Get from database
        const users = await this.driver.getUsersByTier(tier);
        // Store in cache
        this.cache.set(cacheKey, users);
        return users;
    }
    async getExpiredUsers() {
        const cacheKey = 'users:expired';
        // For expired users, we always check the database
        // since this is time-sensitive
        const users = await this.driver.getExpiredUsers();
        // Store in cache with short TTL
        this.cache.set(cacheKey, users, 60); // 60 second TTL
        return users;
    }
}
//# sourceMappingURL=UserService.js.map