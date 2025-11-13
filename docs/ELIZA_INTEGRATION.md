# Eliza Integration Guide

Connect [Eliza](https://github.com/ai16z/eliza) AI agents from ai16z to Mayhem protocol for autonomous token trading.

## What is Eliza?

Eliza is an AI agent framework by ai16z that enables autonomous agents to:
- Interact on Twitter/X
- Execute blockchain transactions
- Manage portfolios
- Make trading decisions
- Build community presence

## Prerequisites

- Eliza framework installed
- Node.js 18+
- Solana wallet
- Twitter/X API access (for social features)

## Installation

### 1. Install Eliza

```bash
git clone https://github.com/ai16z/eliza.git
cd eliza
npm install
```

### 2. Install Mayhem SDK

```bash
npm install @mayhem/llm-sdk
```

## Configuration

### 1. Create Eliza Character

Create `characters/mayhem-trader.json`:

```json
{
  "name": "Mayhem Trader",
  "description": "Autonomous trading agent for Mayhem protocol tokens",
  "modelProvider": "anthropic",
  "settings": {
    "secrets": {
      "ANTHROPIC_API_KEY": "sk-ant-xxx",
      "SOLANA_PRIVATE_KEY": "base58_private_key",
      "TWITTER_USERNAME": "your_bot_username",
      "TWITTER_PASSWORD": "your_bot_password"
    }
  },
  "system": "You are an expert cryptocurrency trader focusing on Mayhem protocol tokens. You analyze market conditions, execute trades, and manage risk. You communicate trading insights on Twitter to build community trust.",
  "bio": [
    "Autonomous AI trader on Mayhem protocol",
    "Analyzing markets 24/7",
    "Building positions in promising tokens",
    "Sharing alpha with the community"
  ],
  "messageExamples": [
    [
      {
        "user": "{{user1}}",
        "content": {
          "text": "Should I buy this token?"
        }
      },
      {
        "user": "Mayhem Trader",
        "content": {
          "text": "Let me analyze the data... Based on 24h volume of $10k, healthy holder distribution, and positive momentum, this looks promising. Starting a small position."
        }
      }
    ]
  ],
  "postExamples": [
    "Just accumulated $TOKEN at $0.0001. Volume picking up, holders growing. This could run 🚀",
    "Market analysis: $TOKEN showing strong support at $0.00008. Looking for breakout above $0.00012 for next leg up.",
    "Automated buyback executed: Burned 1M tokens using creator fees. Supply down, value up. 🔥"
  ],
  "topics": [
    "trading",
    "cryptocurrency",
    "technical analysis",
    "risk management",
    "defi",
    "solana"
  ],
  "style": {
    "all": [
      "analytical",
      "data-driven",
      "measured",
      "professional"
    ],
    "chat": [
      "helpful",
      "educational",
      "transparent about risks"
    ],
    "post": [
      "concise",
      "factual",
      "includes key metrics"
    ]
  }
}
```

### 2. Create Mayhem Plugin

Create `packages/plugin-mayhem/src/index.ts`:

```typescript
import { Plugin } from "@ai16z/eliza";
import { MayhemSDK, LLMConnector } from "@mayhem/llm-sdk";
import { Keypair } from "@solana/web3.js";

export const mayhemPlugin: Plugin = {
  name: "mayhem",
  description: "Mayhem protocol trading integration",
  
  actions: [
    {
      name: "ANALYZE_TOKEN",
      description: "Analyze a token's trading metrics",
      handler: async (runtime, message) => {
        const sdk = getMayhemSDK(runtime);
        const tokenMint = extractTokenMint(message.content);
        
        const metrics = await sdk.getTokenInfo(tokenMint);
        const price = await sdk.getTokenPrice(tokenMint);
        const volume = await sdk.getVolume24h(tokenMint);
        
        return {
          success: true,
          data: { metrics, price, volume }
        };
      }
    },
    
    {
      name: "EXECUTE_TRADE",
      description: "Execute a trade on Mayhem",
      handler: async (runtime, message, params) => {
        const sdk = getMayhemSDK(runtime);
        
        const signature = await sdk.trade({
          tokenMint: params.tokenMint,
          amount: params.amount,
          side: params.side,
        });
        
        return {
          success: true,
          data: { signature }
        };
      }
    },
    
    {
      name: "BUYBACK_BURN",
      description: "Execute buyback and burn",
      handler: async (runtime, message, params) => {
        const sdk = getMayhemSDK(runtime);
        
        const signature = await sdk.buybackAndBurn({
          tokenMint: params.tokenMint,
          solAmount: params.amount,
          burnPercentage: params.burnPercentage || 50,
        });
        
        return {
          success: true,
          data: { signature }
        };
      }
    }
  ],
  
  evaluators: [
    {
      name: "SHOULD_TRADE",
      description: "Evaluate if trading conditions are favorable",
      handler: async (runtime, message) => {
        // LLM decides if it should trade
        const sdk = getMayhemSDK(runtime);
        const llm = getLLMConnector(runtime);
        
        const marketData = await getMarketData(sdk);
        const decision = await llm.decideTrade(marketData);
        
        return decision.confidence > 0.7;
      }
    }
  ],
  
  providers: [
    {
      name: "MAYHEM_SDK",
      get: (runtime) => {
        return new MayhemSDK({
          network: "devnet",
          rpcUrl: process.env.RPC_URL!,
          mayhemProgramId: process.env.MAYHEM_PROGRAM_ID!,
          controllerProgramId: process.env.CONTROLLER_PROGRAM_ID!,
          wallet: Keypair.fromSecretKey(
            Buffer.from(runtime.getSetting("SOLANA_PRIVATE_KEY"))
          ),
        });
      }
    }
  ]
};

function getMayhemSDK(runtime: any): MayhemSDK {
  return runtime.getProvider("MAYHEM_SDK");
}

function getLLMConnector(runtime: any): LLMConnector {
  return new LLMConnector({
    provider: 'anthropic',
    apiKey: runtime.getSetting("ANTHROPIC_API_KEY"),
  });
}

export default mayhemPlugin;
```

### 3. Register Plugin

In `packages/core/src/index.ts`, add:

```typescript
import { mayhemPlugin } from "@ai16z/plugin-mayhem";

// Register plugin
elizaLogger.log("Registering Mayhem plugin");
registerPlugin(mayhemPlugin);
```

## Running Eliza with Mayhem

```bash
# Set environment variables
export ANTHROPIC_API_KEY=sk-ant-xxx
export SOLANA_PRIVATE_KEY=your_base58_key
export RPC_URL=https://api.devnet.solana.com
export MAYHEM_PROGRAM_ID=MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e
export CONTROLLER_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

# Run Eliza with Mayhem character
npm run dev --character=characters/mayhem-trader.json
```

## Eliza Trading Workflows

### 1. Autonomous Trading Loop

```typescript
// Eliza periodically checks market and trades
setInterval(async () => {
  const runtime = getRuntime();
  
  // Evaluate if should trade
  const shouldTrade = await runtime.evaluate("SHOULD_TRADE");
  
  if (shouldTrade) {
    // Execute trade action
    await runtime.executeAction("EXECUTE_TRADE", {
      tokenMint: "YOUR_TOKEN_MINT",
      amount: 0.1,
      side: "buy"
    });
    
    // Post to Twitter
    await runtime.post(
      "Just bought $TOKEN at favorable price. Volume looking healthy! 📈"
    );
  }
}, 300000); // Every 5 minutes
```

### 2. Community Interaction

```typescript
// Respond to Twitter mentions
runtime.on("mention", async (tweet) => {
  if (tweet.text.includes("analysis")) {
    const analysis = await runtime.executeAction("ANALYZE_TOKEN", {
      tokenMint: extractMintFromTweet(tweet)
    });
    
    await runtime.reply(tweet, 
      `Token Analysis:\n` +
      `Price: $${analysis.price}\n` +
      `24h Vol: $${analysis.volume}\n` +
      `Holders: ${analysis.holders}\n` +
      `Trend: ${analysis.trend}`
    );
  }
});
```

### 3. Automated Buyback

```typescript
// Daily buyback from fees
cron.schedule("0 0 * * *", async () => {
  const runtime = getRuntime();
  
  const feeBalance = await sdk.collectFees();
  
  if (feeBalance > 0.1) {
    await runtime.executeAction("BUYBACK_BURN", {
      tokenMint: "YOUR_TOKEN_MINT",
      amount: feeBalance,
      burnPercentage: 50
    });
    
    await runtime.post(
      `Daily buyback complete! Burned ${feeBalance * 0.5} SOL worth of tokens. 🔥`
    );
  }
});
```

## Advanced Features

### Multi-Token Management

```typescript
const tokens = [
  "TOKEN_MINT_1",
  "TOKEN_MINT_2",
  "TOKEN_MINT_3"
];

for (const token of tokens) {
  const metrics = await runtime.executeAction("ANALYZE_TOKEN", { 
    tokenMint: token 
  });
  
  // Trade based on metrics
  if (metrics.score > 0.8) {
    await runtime.executeAction("EXECUTE_TRADE", {
      tokenMint: token,
      amount: 0.1,
      side: "buy"
    });
  }
}
```

### Risk Management

```typescript
// Eliza character with risk limits
{
  "settings": {
    "trading": {
      "maxPositionSize": 1.0, // Max 1 SOL per position
      "maxDailyVolume": 10.0, // Max 10 SOL daily volume
      "stopLossPercent": 20,  // 20% stop loss
      "takeProfitPercent": 50 // 50% take profit
    }
  }
}
```

## Monitoring

```bash
# View Eliza logs
tail -f logs/eliza.log

# Monitor trades
grep "EXECUTE_TRADE" logs/eliza.log

# Check Twitter activity
grep "POST" logs/eliza.log
```

## Best Practices

1. **Start Small**: Test with small amounts on devnet
2. **Monitor Closely**: Watch first week of autonomous trading
3. **Set Limits**: Always use position size and daily limits
4. **Gradual Autonomy**: Start with human approval, gradually automate
5. **Community First**: Focus on building trust through transparency
6. **Legal Compliance**: Ensure bot trading is allowed in your jurisdiction

## Troubleshooting

### "Cannot find module '@ai16z/plugin-mayhem'"
Make sure to build the plugin:
```bash
cd packages/plugin-mayhem
npm run build
```

### "Insufficient SOL for trade"
Ensure wallet has enough SOL:
```bash
solana balance YOUR_WALLET_ADDRESS
solana airdrop 2 YOUR_WALLET_ADDRESS # devnet only
```

### "Twitter API rate limit"
Reduce posting frequency in character config

## Resources

- [Eliza Documentation](https://github.com/ai16z/eliza/blob/main/README.md)
- [ai16z Discord](https://discord.gg/ai16z)
- [Mayhem Discord](https://discord.gg/mayhem)

## Example Eliza Traders

See live examples:
- [@MayhemTraderBot](https://twitter.com/MayhemTraderBot) - Demo bot
- [Community showcase](https://mayhem.io/showcase) - User-created bots
