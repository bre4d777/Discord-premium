/**
 * Premium system configuration
 */
export interface PremiumConfig {
  // Database configuration
  db: {
    driver: 'sqlite';

    // Driver-specific options
    sqlite?: {
      path: string;
    };
  };

  // Premium tiers configuration
  tiers: {
    [tierName: string]: {
      expiresIn?: string | null; // Duration string like '30d', '3m', null = permanent
      price?: number;           // Optional price in cents
      metadata?: Record<string, any>; // Any additional tier-specific data
    };
  };

  // Feature flags for each tier
  features: {
    [tierName: string]: Array<string | 'all'>; // List of features or 'all'
  };

  // Optional cache configuration
  cache?: {
    enabled: boolean;
    ttl?: number; // Time to live in seconds
    maxSize?: number; // Maximum cache size
  };

  // Optional event configuration
  events?: {
    emitExpired?: boolean;
    emitUpgraded?: boolean;
    emitDowngraded?: boolean;
    emitCodeRedeemed?: boolean;
  };
}

/**
 * User premium data
 */
export interface UserData {
  id: string;
  tier: string;
  expiresAt: Date | null;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Gift code data
 */
export interface GiftCodeData {
  code: string;
  tier: string;
  duration: string | null;
  maxUses: number;
  usedCount: number;
  disabled: boolean;
  expiresAt: Date | null;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Options for creating a gift code
 */
export interface GiftCodeOptions {
  tier: string;
  duration: string | null;
  maxUses?: number;
  expiresAt?: Date | null;
  metadata?: Record<string, any>;
}

/**
 * Result of redeeming a gift code
 */
export interface GiftCodeRedemptionResult {
  success: boolean;
  tier: string;
  expiresAt: Date | null;
  error?: string;
}

/**
 * Database driver interface
 */
export interface DriverInterface {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // User methods
  getUser(userId: string): Promise<UserData | null>;
  setUser(userId: string, data: UserData): Promise<void>;
  removeUser(userId: string): Promise<void>;
  getAllUsers(): Promise<UserData[]>;
  getUsersByTier(tier: string): Promise<UserData[]>;
  getExpiredUsers(): Promise<UserData[]>;

  // Gift code methods
  createGiftCode(data: GiftCodeData): Promise<string>;
  getGiftCode(code: string): Promise<GiftCodeData | null>;
  useGiftCode(code: string): Promise<void>;
  disableGiftCode(code: string): Promise<void>;
  listGiftCodes(filter?: object): Promise<GiftCodeData[]>;
}

/**
 * Premium system events
 */
export interface PremiumEvents extends Record<string, (...args: any[]) => void> {
  upgraded: (userId: string, oldTier: string, newTier: string) => void;
  downgraded: (userId: string, oldTier: string, newTier: string) => void;
  expired: (userId: string, tier: string) => void;
  codeRedeemed: (userId: string, code: string, tier: string, expiresAt: Date | null) => void;
  [key: string]: (...args: any[]) => void;
}

/**
 * Extended EventEmitter with typed events
 */
export interface TypedEventEmitter<Events extends Record<string, (...args: any[]) => void>> {
  on<E extends keyof Events>(event: E, listener: Events[E]): this;
  once<E extends keyof Events>(event: E, listener: Events[E]): this;
  emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): boolean;
  off<E extends keyof Events>(event: E, listener: Events[E]): this;
  removeListener<E extends keyof Events>(event: E, listener: Events[E]): this;
  removeAllListeners<E extends keyof Events>(event?: E): this;
  listeners<E extends keyof Events>(event: E): Array<Events[E]>;
  rawListeners<E extends keyof Events>(event: E): Array<Events[E]>;
}

/**
 * Premium System interface
 */
export interface PremiumSystemInterface extends TypedEventEmitter<PremiumEvents> {
  // User methods
  getUser(userId: string): Promise<UserData | null>;
  setUser(userId: string, data: Omit<UserData, 'id'>): Promise<void>;
  removeUser(userId: string): Promise<void>;
  hasTier(userId: string, requiredTier: string): Promise<boolean>;
  hasFeature(userId: string, feature: string): Promise<boolean>;
  getAllUsers(): Promise<UserData[]>;
  getUsersByTier(tier: string): Promise<UserData[]>;
  getExpiredUsers(): Promise<UserData[]>;

  // Gift code methods
  createGiftCode(options: GiftCodeOptions): Promise<string>;
  redeemGiftCode(userId: string, code: string): Promise<GiftCodeRedemptionResult>;
  getGiftCode(code: string): Promise<GiftCodeData | null>;
  disableGiftCode(code: string): Promise<void>;
  listGiftCodes(filter?: object): Promise<GiftCodeData[]>;

  // Utility methods
  isValidTier(tier: string): boolean;
  isValidFeature(feature: string): boolean;
  getFeaturesForTier(tier: string): string[];

  // Lifecycle methods
  shutdown(): Promise<void>;
}
