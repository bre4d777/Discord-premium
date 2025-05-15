import { DriverInterface, GiftCodeData, GiftCodeOptions, GiftCodeRedemptionResult, UserData } from '../types';
import { CacheService } from './CacheService';
import { parseTimeString } from '../utils/timeParser';

export class GiftService {
  private driver: DriverInterface;
  private cache: CacheService;

  constructor(driver: DriverInterface, cache: CacheService) {
    this.driver = driver;
    this.cache = cache;
  }

  /**
   * Generate a unique gift code
   * @returns Unique code in the format GIFT-XXXX-XXXX
   */
  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar chars like O/0, I/1
    let code = 'GIFT-';

    // Generate first part
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    code += '-';

    // Generate second part
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
  }

  /**
   * Create a new gift code
   */
  async createGiftCode(options: GiftCodeOptions): Promise<string> {
    const code = this.generateCode();
    const now = new Date();

    const giftCodeData: GiftCodeData = {
      code,
      tier: options.tier,
      duration: options.duration,
      maxUses: options.maxUses || 1,
      usedCount: 0,
      disabled: false,
      expiresAt: options.expiresAt || null,
      metadata: options.metadata,
      createdAt: now,
      updatedAt: now
    };

    await this.driver.createGiftCode(giftCodeData);

    // Invalidate cache
    this.cache.delete('giftCodes:all');

    return code;
  }

  /**
   * Get a gift code
   */
  async getGiftCode(code: string): Promise<GiftCodeData | null> {
    const cacheKey = `giftCode:${code}`;

    // Try to get from cache first
    const cachedCode = this.cache.get<GiftCodeData>(cacheKey);
    if (cachedCode) return cachedCode;

    // Get from database
    const giftCode = await this.driver.getGiftCode(code);

    // Store in cache if found
    if (giftCode) {
      this.cache.set(cacheKey, giftCode);
    }

    return giftCode;
  }

  /**
   * Redeem a gift code for a user
   */
  async redeemGiftCode(_userId: string, code: string, _userData?: UserData): Promise<GiftCodeRedemptionResult> {
    const giftCode = await this.getGiftCode(code);

    // Check if code exists
    if (!giftCode) {
      return {
        success: false,
        tier: '',
        expiresAt: null,
        error: 'Invalid gift code'
      };
    }

    // Check if code is disabled
    if (giftCode.disabled) {
      return {
        success: false,
        tier: '',
        expiresAt: null,
        error: 'Gift code has been disabled'
      };
    }

    // Check if code has reached max uses
    if (giftCode.usedCount >= giftCode.maxUses) {
      return {
        success: false,
        tier: '',
        expiresAt: null,
        error: 'Gift code has reached maximum uses'
      };
    }

    // Check if code has expired
    if (giftCode.expiresAt && giftCode.expiresAt < new Date()) {
      return {
        success: false,
        tier: '',
        expiresAt: null,
        error: 'Gift code has expired'
      };
    }

    // Calculate expiry date based on duration
    let expiresAt: Date | null = null;

    if (giftCode.duration) {
      const durationMs = parseTimeString(giftCode.duration);
      expiresAt = new Date(Date.now() + durationMs);
    }

    // Increment used count
    await this.driver.useGiftCode(code);

    // Invalidate cache
    this.cache.delete(`giftCode:${code}`);
    this.cache.delete('giftCodes:all');

    return {
      success: true,
      tier: giftCode.tier,
      expiresAt
    };
  }

  /**
   * Disable a gift code
   */
  async disableGiftCode(code: string): Promise<void> {
    await this.driver.disableGiftCode(code);

    // Invalidate cache
    this.cache.delete(`giftCode:${code}`);
    this.cache.delete('giftCodes:all');
  }

  /**
   * List all gift codes
   */
  async listGiftCodes(filter?: object): Promise<GiftCodeData[]> {
    const cacheKey = filter ? `giftCodes:filter:${JSON.stringify(filter)}` : 'giftCodes:all';

    // Try to get from cache first
    const cachedCodes = this.cache.get<GiftCodeData[]>(cacheKey);
    if (cachedCodes) return cachedCodes;

    // Get from database
    const giftCodes = await this.driver.listGiftCodes(filter);

    // Store in cache
    this.cache.set(cacheKey, giftCodes);

    return giftCodes;
  }
}
