import { createPremiumSystem, PremiumConfig } from '../src';

// Example configuration
const config: PremiumConfig = {
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
  try {
    console.log('Initializing premium system...');
    const premium = await createPremiumSystem(config);

    // Add an example user
    console.log('Adding example user with pro tier...');
    const userId = '123456789';
    await premium.setUser(userId, {
      tier: 'pro',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: { source: 'example' }
    });

    // Get user info
    const user = await premium.getUser(userId);
    console.log('User info:', user);

    // Check tier
    const isPro = await premium.hasTier(userId, 'pro');
    console.log('User has pro tier:', isPro);

    // Check features
    const features = ['basicCommands', 'audioFilters', 'customPlaylists', '24/7', 'prioritySupport'];
    for (const feature of features) {
      const hasFeature = await premium.hasFeature(userId, feature);
      console.log(`User has ${feature}:`, hasFeature);
    }

    // Create a gift code
    console.log('Creating gift code...');
    const code = await premium.createGiftCode({
      tier: 'plus',
      duration: '7d',
      maxUses: 1
    });
    console.log('Gift code created:', code);

    // Get gift code info
    const giftCode = await premium.getGiftCode(code);
    console.log('Gift code info:', giftCode);

    // Example of event listeners
    premium.on('upgraded', (userId, oldTier, newTier) => {
      console.log(`User ${userId} upgraded from ${oldTier} to ${newTier}`);
    });

    premium.on('expired', (userId, tier) => {
      console.log(`User ${userId}'s ${tier} subscription expired`);
    });

    premium.on('codeRedeemed', (userId, code, tier, expiresAt) => {
      console.log(`User ${userId} redeemed code ${code} for ${tier} until ${expiresAt?.toDateString() || 'forever'}`);
    });

    // Redeem the gift code with a different user
    const otherUserId = '987654321';
    console.log(`Redeeming code ${code} for user ${otherUserId}...`);
    const result = await premium.redeemGiftCode(otherUserId, code);
    console.log('Redemption result:', result);

    // Check all users
    const allUsers = await premium.getAllUsers();
    console.log('All users:', allUsers);

    // Clean up
    console.log('Cleaning up...');
    await premium.shutdown();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
