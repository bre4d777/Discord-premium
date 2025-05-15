/**
 * Base error class for all premium system errors
 */
export class PremiumError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PremiumError';
  }
}

/**
 * Error thrown when a database operation fails
 */
export class DatabaseError extends PremiumError {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Error thrown when a gift code operation fails
 */
export class GiftCodeError extends PremiumError {
  constructor(message: string) {
    super(message);
    this.name = 'GiftCodeError';
  }
}

/**
 * Error thrown when a configuration value is invalid
 */
export class ConfigError extends PremiumError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Error thrown when a tier operation fails
 */
export class TierError extends PremiumError {
  constructor(message: string) {
    super(message);
    this.name = 'TierError';
  }
}

/**
 * Error thrown when a feature operation fails
 */
export class FeatureError extends PremiumError {
  constructor(message: string) {
    super(message);
    this.name = 'FeatureError';
  }
}
