export class ExpiryService {
    constructor(driver, premiumSystem) {
        Object.defineProperty(this, "driver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "premiumSystem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "checkInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.driver = driver;
        this.premiumSystem = premiumSystem;
    }
    /**
     * Start checking for expired premium subscriptions
     * @param intervalMs Interval in milliseconds. Default: 60 seconds
     */
    startExpiryChecker(intervalMs = 60 * 1000) {
        this.checkInterval = setInterval(() => this.checkExpirations(), intervalMs);
    }
    /**
     * Stop checking for expirations
     */
    stopExpiryChecker() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
    /**
     * Check for expired premium subscriptions
     */
    async checkExpirations() {
        try {
            const expiredUsers = await this.driver.getExpiredUsers();
            for (const user of expiredUsers) {
                // Emit expired event
                this.premiumSystem.emit('expired', user.id, user.tier);
                // Reset user to free tier
                await this.premiumSystem.setUser(user.id, {
                    tier: 'free',
                    expiresAt: null,
                    metadata: { ...user.metadata, previousTier: user.tier }
                });
            }
        }
        catch (error) {
            console.error('Error checking expirations:', error);
        }
    }
}
//# sourceMappingURL=ExpiryService.js.map