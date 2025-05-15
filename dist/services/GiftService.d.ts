import { DriverInterface, GiftCodeData, GiftCodeOptions, GiftCodeRedemptionResult, UserData } from '../types';
import { CacheService } from './CacheService';
export declare class GiftService {
    private driver;
    private cache;
    constructor(driver: DriverInterface, cache: CacheService);
    /**
     * Generate a unique gift code
     * @returns Unique code in the format GIFT-XXXX-XXXX
     */
    private generateCode;
    /**
     * Create a new gift code
     */
    createGiftCode(options: GiftCodeOptions): Promise<string>;
    /**
     * Get a gift code
     */
    getGiftCode(code: string): Promise<GiftCodeData | null>;
    /**
     * Redeem a gift code for a user
     */
    redeemGiftCode(_userId: string, code: string, _userData?: UserData): Promise<GiftCodeRedemptionResult>;
    /**
     * Disable a gift code
     */
    disableGiftCode(code: string): Promise<void>;
    /**
     * List all gift codes
     */
    listGiftCodes(filter?: object): Promise<GiftCodeData[]>;
}
//# sourceMappingURL=GiftService.d.ts.map