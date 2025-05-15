import { DriverInterface, UserData } from '../types';
import { CacheService } from './CacheService';
export declare class UserService {
    private driver;
    private cache;
    constructor(driver: DriverInterface, cache: CacheService);
    getUser(userId: string): Promise<UserData | null>;
    setUser(userId: string, data: UserData): Promise<void>;
    removeUser(userId: string): Promise<void>;
    getAllUsers(): Promise<UserData[]>;
    getUsersByTier(tier: string): Promise<UserData[]>;
    getExpiredUsers(): Promise<UserData[]>;
}
//# sourceMappingURL=UserService.d.ts.map