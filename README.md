# Discord Premium System

A flexible premium tier system for Discord bots with support for tiers, features, gift codes and more.

## Features

- 💾 SQLite database support
- 🏆 Tier-based permission system
- 🚩 Feature flags for granular access control
- 🎁 Gift code generation and redemption
- ⌛ Expiration management with automatic downgrades
- 📢 Event system for integration with bot logic
- 📊 Type-safe API with full TypeScript support

## Installation

```bash
# Install the package


# SQLite is a peer dependency
npm install better-sqlite3
```

## Quick Start

```typescript
import { createPremiumSystem } from '@bre4d777/discord-premium';

// Create a configuration
const config = {
  db: {
    driver: 'sqlite',
    sqlite: {
      path: './data/premium.sqlite'
    }
  },

  tiers: {
    free: {},
    plus: {
      expiresIn: '30d',
      price: 499 // $4.99
    },
    pro: {
      expiresIn: '30d',
      price: 999 // $9.99
    },
    ultra: {
      expiresIn: null, // permanent
      price: 4999 // $49.99
    }
  },

  features: {
    free: ['basicCommands'],
    plus: ['basicCommands', 'audioFilters', 'customPlaylists'],
    pro: ['basicCommands', 'audioFilters', 'customPlaylists', '24/7', 'prioritySupport'],
    ultra: ['all']
  },

  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
    maxSize: 1000
  }
};

async function main() {
  // Initialize premium system
  const premium = await createPremiumSystem(config);

  // Use in your Discord.js bot
  client.on('interactionCreate', async (interaction) => {
    // Check if user has premium feature
    if (await premium.hasFeature(interaction.user.id, 'audioFilters')) {
      // Handle premium feature
    } else {
      interaction.reply('This feature requires Premium!');
    }
  });
}

main().catch(console.error);
```

## API Reference

### User Management

```typescript
// Set a user's premium tier
await premium.setUser('123456789', {
  tier: 'pro',
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  metadata: { source: 'website_purchase' }
});

// Get user info
const user = await premium.getUser('123456789');
// Returns: { id: '123456789', tier: 'pro', expiresAt: Date, metadata: {...} }

// Check if user has a specific tier or higher
const isPro = await premium.hasTier('123456789', 'pro');

// Check if user has a specific feature
const hasAudioFilters = await premium.hasFeature('123456789', 'audioFilters');

// Remove premium from a user
await premium.removeUser('123456789');
```

### Gift Code Management

```typescript
// Generate a gift code
const code = await premium.createGiftCode({
  tier: 'pro',
  duration: '30d', // 30 days
  maxUses: 1, // Single-use
  metadata: { source: 'promotion' }
});

// Redeem a gift code
const result = await premium.redeemGiftCode('123456789', 'GIFT-1234-5678');
// Returns: { success: true, tier: 'pro', expiresAt: Date }

// Get gift code info
const codeInfo = await premium.getGiftCode('GIFT-1234-5678');
// Returns: { code: 'GIFT-1234-5678', tier: 'pro', duration: '30d', maxUses: 1, usedCount: 0, ... }

// List all active gift codes
const codes = await premium.listGiftCodes();

// Disable a gift code
await premium.disableGiftCode('GIFT-1234-5678');
```

### Event System

```typescript
// Listen for user upgrades
premium.on('upgraded', (userId, oldTier, newTier) => {
  console.log(`User ${userId} upgraded from ${oldTier} to ${newTier}`);
  // Update Discord roles, send message, etc.
});

// Listen for premium expiry
premium.on('expired', (userId, tier) => {
  console.log(`User ${userId}'s ${tier} subscription expired`);
  // Update roles, notify user
});

// Listen for downgrades
premium.on('downgraded', (userId, oldTier, newTier) => {
  console.log(`User ${userId} downgraded from ${oldTier} to ${newTier}`);
});

// Listen for gift code redemptions
premium.on('codeRedeemed', (userId, code, tier, expiresAt) => {
  console.log(`User ${userId} redeemed code ${code} for ${tier}`);
});
```

### Feature Checking

```typescript
// Check if a feature exists in any tier
const featureExists = premium.isValidFeature('audioFilters');

// Get all features for a tier
const proFeatures = premium.getFeaturesForTier('pro');
// Returns: ['audioFilters', '24/7', ...]

// Check if a tier exists
const tierExists = premium.isValidTier('ultra');
```

### Bulk Operations

```typescript
// Get all premium users
const allUsers = await premium.getAllUsers();

// Get users by tier
const proUsers = await premium.getUsersByTier('pro');

// Find expired users
const expiredUsers = await premium.getExpiredUsers();
```

## Example Discord.js Integration

```typescript
import { Client, Intents } from 'discord.js';
import { createPremiumSystem } from '@bre4d777/discord-premium';
import config from './premium.config';

const client = new Client({ intents: [/* your intents */] });
let premium;

async function main() {
  // Initialize premium system
  premium = await createPremiumSystem(config);

  // Set up event listeners
  premium.on('upgraded', (userId, oldTier, newTier) => {
    console.log(`User ${userId} upgraded from ${oldTier} to ${newTier}`);
    // Update roles, send messages, etc.
  });

  premium.on('expired', (userId, tier) => {
    console.log(`User ${userId}'s ${tier} subscription expired`);
    // Update roles, notify user
  });

  // Start Discord bot
  await client.login(process.env.DISCORD_TOKEN);
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'premium') {
    const user = await premium.getUser(interaction.user.id);

    if (user) {
      interaction.reply(`You have ${user.tier} tier until ${user.expiresAt?.toDateString() || 'forever'}`);
    } else {
      interaction.reply('You don\'t have premium yet! Use /upgrade to get started.');
    }
  }

  if (interaction.commandName === 'redeem') {
    const code = interaction.options.getString('code');

    try {
      const result = await premium.redeemGiftCode(interaction.user.id, code);
      if (result.success) {
        interaction.reply(`Successfully redeemed ${result.tier} tier until ${result.expiresAt?.toDateString() || 'forever'}!`);
      }
    } catch (error) {
      interaction.reply(`Error: ${error.message}`);
    }
  }

  // Example of a premium-only command
  if (interaction.commandName === 'filters') {
    if (await premium.hasFeature(interaction.user.id, 'audioFilters')) {
      // Handle audio filters
      interaction.reply('Here are your audio filters!');
    } else {
      interaction.reply('Audio filters are available with Plus tier or higher! Use /upgrade to get started.');
    }
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await premium.shutdown();
  process.exit(0);
});

main().catch(console.error);
```

## License

MIT
