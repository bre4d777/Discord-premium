/**
 * Base error class for all premium system errors
 */
export declare class PremiumError extends Error {
    constructor(message: string);
}
/**
 * Error thrown when a database operation fails
 */
export declare class DatabaseError extends PremiumError {
    constructor(message: string);
}
/**
 * Error thrown when a gift code operation fails
 */
export declare class GiftCodeError extends PremiumError {
    constructor(message: string);
}
/**
 * Error thrown when a configuration value is invalid
 */
export declare class ConfigError extends PremiumError {
    constructor(message: string);
}
/**
 * Error thrown when a tier operation fails
 */
export declare class TierError extends PremiumError {
    constructor(message: string);
}
/**
 * Error thrown when a feature operation fails
 */
export declare class FeatureError extends PremiumError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map