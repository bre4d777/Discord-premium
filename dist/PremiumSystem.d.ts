import { DriverInterface, PremiumConfig, PremiumEvents, TypedEventEmitter, UserData, GiftCodeOptions, GiftCodeRedemptionResult, GiftCodeData } from './types';
declare const PremiumSystem_base: new () => TypedEventEmitter<PremiumEvents>;
/**
 * The main class for the premium system
 */
export declare class PremiumSystem extends PremiumSystem_base {
    private driver;
    private config;
    private cache;
    private userService;
    private giftService;
    private expiryService;
    constructor(driver: DriverInterface, config: PremiumConfig);
    /**
     * Start checking for expired premium subscriptions
     */
    startExpiryChecker(): void;
    /**
     * Get a user's premium info
     */
    getUser(userId: string): Promise<UserData | null>;
    /**
     * Set a user's premium tier
     */
    setUser(userId: string, data: Omit<UserData, 'id'>): Promise<void>;
    /**
     * Remove a user's premium tier
     */
    removeUser(userId: string): Promise<void>;
    /**
     * Check if a user has a specific tier or higher
     */
    hasTier(userId: string, requiredTier: string): Promise<boolean>;
    /**
     * Check if a user has access to a specific feature
     */
    hasFeature(userId: string, feature: string): Promise<boolean>;
    /**
     * Get all premium users
     */
    getAllUsers(): Promise<UserData[]>;
    /**
     * Get users by tier
     */
    getUsersByTier(tier: string): Promise<UserData[]>;
    /**
     * Get expired users
     */
    getExpiredUsers(): Promise<UserData[]>;
    /**
     * Create a new gift code
     */
    createGiftCode(options: GiftCodeOptions): Promise<string>;
    /**
     * Redeem a gift code for a user
     */
    redeemGiftCode(userId: string, code: string): Promise<GiftCodeRedemptionResult>;
    /**
     * Get a gift code's info
     */
    getGiftCode(code: string): Promise<GiftCodeData | null>;
    /**
     * Disable a gift code
     */
    disableGiftCode(code: string): Promise<void>;
    /**
     * List all gift codes
     */
    listGiftCodes(filter?: object): Promise<GiftCodeData[]>;
    /**
     * Check if a tier exists
     */
    isValidTier(tier: string): boolean;
    /**
     * Check if a feature exists in any tier
     */
    isValidFeature(feature: string): boolean;
    /**
     * Get all features for a tier
     */
    getFeaturesForTier(tier: string): string[];
    /**
     * Clean up resources
     */
    shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=PremiumSystem.d.ts.map