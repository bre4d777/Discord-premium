import { DriverInterface } from '../types';
import { PremiumSystem } from '../PremiumSystem';

export class ExpiryService {
  private driver: DriverInterface;
  private premiumSystem: PremiumSystem;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(driver: DriverInterface, premiumSystem: PremiumSystem) {
    this.driver = driver;
    this.premiumSystem = premiumSystem;
  }

  /**
   * Start checking for expired premium subscriptions
   * @param intervalMs Interval in milliseconds. Default: 60 seconds
   */
  startExpiryChecker(intervalMs = 60 * 1000): void {
    this.checkInterval = setInterval(() => this.checkExpirations(), intervalMs);
  }

  /**
   * Stop checking for expirations
   */
  stopExpiryChecker(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check for expired premium subscriptions
   */
  async checkExpirations(): Promise<void> {
    try {
      const expiredUsers = await this.driver.getExpiredUsers();

      for (const user of expiredUsers) {
        // Emit expired event
        this.premiumSystem.emit('expired', user.id, user.tier);

        // Reset user to free tier
        await this.premiumSystem.setUser(user.id, {
          tier: 'free',
          expiresAt: null,
          metadata: { ...user.metadata, previousTier: user.tier }
        });
      }
    } catch (error) {
      console.error('Error checking expirations:', error);
    }
  }
}
