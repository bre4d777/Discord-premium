import { EventEmitter } from 'events';
import { CacheService } from './services/CacheService';
import { UserService } from './services/UserService';
import { GiftService } from './services/GiftService';
import { ExpiryService } from './services/ExpiryService';
import { TierError, FeatureError } from './utils/errors';
/**
 * The main class for the premium system
 */
export class PremiumSystem extends EventEmitter {
    constructor(driver, config) {
        super();
        Object.defineProperty(this, "driver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
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
        Object.defineProperty(this, "userService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "giftService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "expiryService", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.driver = driver;
        this.config = config;
        // Initialize services
        this.cache = new CacheService(config.cache);
        this.userService = new UserService(driver, this.cache);
        this.giftService = new GiftService(driver, this.cache);
        this.expiryService = new ExpiryService(driver, this);
    }
    /**
     * Start checking for expired premium subscriptions
     */
    startExpiryChecker() {
        this.expiryService.startExpiryChecker();
    }
    // User methods
    /**
     * Get a user's premium info
     */
    async getUser(userId) {
        return this.userService.getUser(userId);
    }
    /**
     * Set a user's premium tier
     */
    async setUser(userId, data) {
        // Validate tier
        if (!this.isValidTier(data.tier)) {
            throw new TierError(`Invalid tier: ${data.tier}`);
        }
        const oldUser = await this.getUser(userId);
        const userData = {
            id: userId,
            ...data
        };
        await this.userService.setUser(userId, userData);
        // Emit events if needed
        if (this.config.events) {
            if (oldUser && oldUser.tier !== data.tier) {
                // Tier changed - determine if upgrade or downgrade
                const tiers = Object.keys(this.config.tiers);
                const oldTierIndex = tiers.indexOf(oldUser.tier);
                const newTierIndex = tiers.indexOf(data.tier);
                if (newTierIndex > oldTierIndex) {
                    if (this.config.events.emitUpgraded !== false) {
                        this.emit('upgraded', userId, oldUser.tier, data.tier);
                    }
                }
                else if (newTierIndex < oldTierIndex) {
                    if (this.config.events.emitDowngraded !== false) {
                        this.emit('downgraded', userId, oldUser.tier, data.tier);
                    }
                }
            }
        }
    }
    /**
     * Remove a user's premium tier
     */
    async removeUser(userId) {
        await this.userService.removeUser(userId);
    }
    /**
     * Check if a user has a specific tier or higher
     */
    async hasTier(userId, requiredTier) {
        if (!this.isValidTier(requiredTier)) {
            throw new TierError(`Invalid tier: ${requiredTier}`);
        }
        const user = await this.getUser(userId);
        if (!user)
            return false;
        const tiers = Object.keys(this.config.tiers);
        const userTierIndex = tiers.indexOf(user.tier);
        const requiredTierIndex = tiers.indexOf(requiredTier);
        // User's tier must be equal or higher in the list
        return userTierIndex >= requiredTierIndex;
    }
    /**
     * Check if a user has access to a specific feature
     */
    async hasFeature(userId, feature) {
        if (!this.isValidFeature(feature)) {
            throw new FeatureError(`Invalid feature: ${feature}`);
        }
        const user = await this.getUser(userId);
        if (!user)
            return false;
        const tierFeatures = this.config.features[user.tier] || [];
        return tierFeatures.includes('all') || tierFeatures.includes(feature);
    }
    /**
     * Get all premium users
     */
    async getAllUsers() {
        return this.userService.getAllUsers();
    }
    /**
     * Get users by tier
     */
    async getUsersByTier(tier) {
        if (!this.isValidTier(tier)) {
            throw new TierError(`Invalid tier: ${tier}`);
        }
        return this.userService.getUsersByTier(tier);
    }
    /**
     * Get expired users
     */
    async getExpiredUsers() {
        return this.userService.getExpiredUsers();
    }
    // Gift code methods
    /**
     * Create a new gift code
     */
    async createGiftCode(options) {
        if (!this.isValidTier(options.tier)) {
            throw new TierError(`Invalid tier: ${options.tier}`);
        }
        return this.giftService.createGiftCode(options);
    }
    /**
     * Redeem a gift code for a user
     */
    async redeemGiftCode(userId, code) {
        const user = await this.getUser(userId);
        const result = await this.giftService.redeemGiftCode(userId, code, user || undefined);
        if (result.success) {
            // Update user with new tier
            await this.setUser(userId, {
                tier: result.tier,
                expiresAt: result.expiresAt,
                metadata: {
                    ...(user?.metadata || {}),
                    giftCode: code,
                    redeemedAt: new Date()
                }
            });
            // Emit event if enabled
            if (this.config.events?.emitCodeRedeemed !== false) {
                this.emit('codeRedeemed', userId, code, result.tier, result.expiresAt);
            }
        }
        return result;
    }
    /**
     * Get a gift code's info
     */
    async getGiftCode(code) {
        return this.giftService.getGiftCode(code);
    }
    /**
     * Disable a gift code
     */
    async disableGiftCode(code) {
        return this.giftService.disableGiftCode(code);
    }
    /**
     * List all gift codes
     */
    async listGiftCodes(filter) {
        return this.giftService.listGiftCodes(filter);
    }
    // Utility methods
    /**
     * Check if a tier exists
     */
    isValidTier(tier) {
        return tier in this.config.tiers;
    }
    /**
     * Check if a feature exists in any tier
     */
    isValidFeature(feature) {
        return Object.values(this.config.features).some(features => features.includes('all') || features.includes(feature));
    }
    /**
     * Get all features for a tier
     */
    getFeaturesForTier(tier) {
        if (!this.isValidTier(tier)) {
            throw new TierError(`Invalid tier: ${tier}`);
        }
        return this.config.features[tier] || [];
    }
    /**
     * Clean up resources
     */
    async shutdown() {
        this.expiryService.stopExpiryChecker();
        this.cache.clear();
        await this.driver.shutdown();
    }
}
//# sourceMappingURL=PremiumSystem.js.map