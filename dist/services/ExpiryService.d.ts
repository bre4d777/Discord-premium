import { DriverInterface } from '../types';
import { PremiumSystem } from '../PremiumSystem';
export declare class ExpiryService {
    private driver;
    private premiumSystem;
    private checkInterval;
    constructor(driver: DriverInterface, premiumSystem: PremiumSystem);
    /**
     * Start checking for expired premium subscriptions
     * @param intervalMs Interval in milliseconds. Default: 60 seconds
     */
    startExpiryChecker(intervalMs?: number): void;
    /**
     * Stop checking for expirations
     */
    stopExpiryChecker(): void;
    /**
     * Check for expired premium subscriptions
     */
    checkExpirations(): Promise<void>;
}
//# sourceMappingURL=ExpiryService.d.ts.map