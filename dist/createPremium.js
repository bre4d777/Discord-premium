import { PremiumSystem } from './PremiumSystem';
import { ConfigError } from './utils/errors';
import { SqliteDriver } from './drivers/SqliteDriver';
import Database from 'better-sqlite3';
/**
 * Create and initialize a premium system
 */
export async function createPremiumSystem(config) {
    validateConfig(config);
    // Load driver
    const driver = await loadDriver(config);
    // Initialize driver
    await driver.initialize();
    // Create and initialize premium system
    const premiumSystem = new PremiumSystem(driver, config);
    // Start expiry checker if events are enabled
    if (config.events?.emitExpired !== false) {
        premiumSystem.startExpiryChecker();
    }
    return premiumSystem;
}
/**
 * Validate configuration
 */
function validateConfig(config) {
    // Check if driver is provided
    if (!config.db || !config.db.driver) {
        throw new ConfigError('Database driver must be specified');
    }
    // Check if tiers are provided
    if (!config.tiers || Object.keys(config.tiers).length === 0) {
        throw new ConfigError('At least one tier must be defined');
    }
    // Check if features are provided
    if (!config.features || Object.keys(config.features).length === 0) {
        throw new ConfigError('Features must be defined for tiers');
    }
    // Check if each tier has features
    for (const tier of Object.keys(config.tiers)) {
        if (!config.features[tier]) {
            throw new ConfigError(`Features not defined for tier: ${tier}`);
        }
    }
    // Driver-specific validation
    if (config.db.driver === 'sqlite') {
        if (!config.db.sqlite?.path) {
            throw new ConfigError('SQLite database path must be specified');
        }
    }
}
/**
 * Load database driver
 */
async function loadDriver(config) {
    switch (config.db.driver) {
        case 'sqlite':
            return new SqliteDriver(Database, config.db.sqlite);
        default:
            throw new ConfigError(`Unsupported database driver: ${config.db.driver}`);
    }
}
//# sourceMappingURL=createPremium.js.map