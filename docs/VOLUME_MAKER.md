# Volume Maker - Organic Trading Volume

Generate natural trading volume for your token to increase visibility and liquidity.

## Overview

The Volume Maker bot executes trades that:
- Create organic-looking trading patterns
- Maintain healthy spreads
- Avoid wash trading detection
- Build market depth
- Increase token visibility

## Configuration

```typescript
import { VolumeMaker } from '@mayhem/llm-sdk/strategies';

const volumeMaker = new VolumeMaker(sdk, {
  tokenMint: 'YOUR_TOKEN_MINT',
  
  // Volume targets
  dailyVolumeTarget: 10000, // $10k daily volume
  minTradeSize: 10,         // $10 minimum trade
  maxTradeSize: 500,        // $500 maximum trade
  
  // Timing
  minInterval: 300,         // 5 min between trades
  maxInterval: 3600,        // 1 hour between trades
  
  // Risk management
  maxSpread: 0.02,          // 2% max spread
  maxSlippage: 0.01,        // 1% max slippage
  inventoryLimit: 5000,     // Max $5k inventory
  
  // Pattern randomization
  patternVariation: 0.3,    // 30% timing variation
  sizeVariation: 0.5,       // 50% size variation
});
```

## Natural Patterns

### 1. Time Distribution

```typescript
// Don't trade at fixed intervals - too obvious
// Instead, use randomized timing with peak hours

volumeMaker.setTradingHours({
  timezone: 'UTC',
  peakHours: [14, 15, 16, 17, 18], // 2pm-6pm UTC
  quietHours: [0, 1, 2, 3, 4, 5],  // Midnight-6am UTC
  
  // More active during peak hours
  peakMultiplier: 2.0,
  quietMultiplier: 0.3,
});
```

### 2. Size Distribution

```typescript
// Mix of small, medium, large trades
volumeMaker.setSizeDistribution({
  small: { weight: 0.6, range: [10, 50] },   // 60% small trades
  medium: { weight: 0.3, range: [50, 200] }, // 30% medium
  large: { weight: 0.1, range: [200, 500] }, // 10% large
});
```

### 3. Buy/Sell Ratio

```typescript
// Maintain balanced or slight buy pressure
volumeMaker.setBuySellRatio({
  buy: 0.55,  // 55% buy orders
  sell: 0.45, // 45% sell orders
  
  // Adjust based on price action
  dynamicAdjustment: true,
});
```

## Start Volume Making

```typescript
await volumeMaker.start();

console.log('🎯 Volume maker started');
console.log('Daily target:', volumeMaker.config.dailyVolumeTarget);

// Monitor progress
setInterval(async () => {
  const stats = await volumeMaker.getStats();
  console.log(`Progress: ${stats.volumeToday}/${stats.dailyTarget}`);
  console.log(`Trades today: ${stats.tradesExecuted}`);
}, 60000); // Every minute
```

## Advanced Strategies

### Liquidity Provision

```typescript
// Place limit orders to build orderbook
await volumeMaker.provideLiquidity({
  spread: 0.005, // 0.5% spread
  depth: 5,      // 5 price levels
  baseSize: 100, // $100 per level
  refresh: 300,  // Refresh every 5 min
});
```

### Reaction to Real Trades

```typescript
// React to real user trades naturally
volumeMaker.on('realTrade', async (trade) => {
  // Wait 1-5 minutes
  await randomDelay(60, 300);
  
  // Execute opposite trade with variation
  const amount = trade.amount * (0.3 + Math.random() * 0.4);
  const side = trade.side === 'buy' ? 'sell' : 'buy';
  
  await volumeMaker.executeTrade({ side, amount });
});
```

### Peak Volume Events

```typescript
// Increase activity during launches/announcements
await volumeMaker.scheduleEvent({
  startTime: new Date('2025-01-01T14:00:00Z'),
  duration: 3600, // 1 hour
  volumeMultiplier: 5.0,
  announcement: 'Major partnership announcement',
});
```

## Safety Features

### 1. Wash Trading Detection

```typescript
// Avoid patterns that look like wash trading
volumeMaker.enableSafetyChecks({
  // Don't trade with self
  avoidSelfTrades: true,
  
  // Vary wallet addresses
  rotateWallets: true,
  walletCount: 5,
  
  // Randomize everything
  randomizeTimestamps: true,
  randomizeAmounts: true,
});
```

### 2. Inventory Management

```typescript
// Prevent excessive token accumulation
volumeMaker.setInventoryLimits({
  maxTokens: 1000000,    // Max tokens to hold
  maxSOL: 10,            // Max SOL to use
  rebalanceThreshold: 0.7, // Rebalance at 70%
});

// Auto-rebalance when limits reached
volumeMaker.on('inventoryHigh', async () => {
  console.log('🔄 Rebalancing inventory...');
  await volumeMaker.rebalanceInventory();
});
```

### 3. Budget Management

```typescript
// Daily spending limits
volumeMaker.setBudget({
  dailyMax: 1000,        // $1k daily max
  stopOnExhausted: true,
  
  // Alert when low
  alertThreshold: 0.2, // Alert at 20% remaining
});
```

## Monitoring

```typescript
// Real-time stats
const stats = await volumeMaker.getStats();

console.log('Volume Maker Stats:');
console.log('- Daily volume:', stats.volumeToday);
console.log('- Trades executed:', stats.tradesExecuted);
console.log('- Buy/Sell ratio:', stats.buySellRatio);
console.log('- Avg trade size:', stats.avgTradeSize);
console.log('- Current inventory:', stats.inventory);
console.log('- Budget remaining:', stats.budgetRemaining);
```

## Best Practices

1. **Start Small**: Begin with low daily targets
2. **Vary Everything**: Randomize timing, size, and patterns
3. **Monitor Markets**: Reduce activity during low liquidity
4. **Maintain Balance**: Keep buy/sell ratio near 1:1
5. **Track Costs**: Monitor fees and slippage
6. **Stay Legal**: Comply with platform rules
7. **Use Multiple Wallets**: Rotate between wallets
8. **React Naturally**: Respond to real trades

## Example: Full Setup

```typescript
import { MayhemSDK, VolumeMaker } from '@mayhem/llm-sdk';

async function setupVolumeMaker() {
  const sdk = new MayhemSDK({
    network: 'devnet',
    rpcUrl: process.env.RPC_URL!,
    mayhemProgramId: process.env.MAYHEM_PROGRAM_ID!,
    wallet: loadWallet(),
  });

  await sdk.initialize();

  const volumeMaker = new VolumeMaker(sdk, {
    tokenMint: process.env.TOKEN_MINT!,
    dailyVolumeTarget: 10000,
    minTradeSize: 10,
    maxTradeSize: 500,
    minInterval: 300,
    maxInterval: 3600,
  });

  // Configure natural patterns
  volumeMaker.setTradingHours({
    peakHours: [14, 15, 16, 17, 18],
    peakMultiplier: 2.0,
  });

  volumeMaker.setSizeDistribution({
    small: { weight: 0.6, range: [10, 50] },
    medium: { weight: 0.3, range: [50, 200] },
    large: { weight: 0.1, range: [200, 500] },
  });

  // Enable safety features
  volumeMaker.enableSafetyChecks({
    avoidSelfTrades: true,
    rotateWallets: true,
    walletCount: 5,
  });

  // Start
  await volumeMaker.start();

  console.log('✅ Volume maker running');
}

setupVolumeMaker().catch(console.error);
```

## Compliance

⚠️ **Important**: Volume making must comply with:
- Platform terms of service
- Local regulations
- Exchange rules
- Anti-manipulation laws

Always consult legal counsel before implementing volume making strategies.
