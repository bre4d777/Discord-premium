import { DriverInterface, GiftCodeData, UserData } from '../types';
/**
 * Abstract base driver that all database drivers extend
 */
export declare abstract class BaseDriver implements DriverInterface {
    abstract initialize(): Promise<void>;
    abstract shutdown(): Promise<void>;
    abstract getUser(userId: string): Promise<UserData | null>;
    abstract setUser(userId: string, data: UserData): Promise<void>;
    abstract removeUser(userId: string): Promise<void>;
    abstract getAllUsers(): Promise<UserData[]>;
    abstract getUsersByTier(tier: string): Promise<UserData[]>;
    abstract getExpiredUsers(): Promise<UserData[]>;
    abstract createGiftCode(data: GiftCodeData): Promise<string>;
    abstract getGiftCode(code: string): Promise<GiftCodeData | null>;
    abstract useGiftCode(code: string): Promise<void>;
    abstract disableGiftCode(code: string): Promise<void>;
    abstract listGiftCodes(filter?: object): Promise<GiftCodeData[]>;
}
//# sourceMappingURL=BaseDriver.d.ts.map