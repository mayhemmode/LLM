# Mayhem LLM Trading SDK

Connect AI agents (Eliza, OpenRouter, custom LLMs) to Mayhem protocol for autonomous token trading, buyback, burn, and marketing automation.

## 🤖 Overview

The Mayhem LLM SDK enables AI agents to:
- **Trade** tokens autonomously based on market conditions
- **Buyback & Burn** tokens using creator fees
- **Add Liquidity** to pools from accumulated fees
- **Volume Making** to increase trading activity
- **AI Marketing** (upcoming) - autonomous marketing budget allocation

---

## 📁 Directory Structure

```
github-llm/
├── sdk/
│   ├── mayhem-sdk.ts         # Core SDK for Mayhem program
│   ├── llm-connector.ts      # Connect LLMs to SDK
│   ├── trading-agent.ts      # Autonomous trading logic
│   └── marketing-agent.ts    # AI marketing automation
│
├── docs/
│   ├── QUICKSTART.md         # Get started in 5 minutes
│   ├── ELIZA_INTEGRATION.md  # Connect Eliza agents
│   ├── OPENROUTER_SETUP.md   # Use OpenRouter LLMs
│   ├── TRADING_STRATEGIES.md # Trading algorithm docs
│   ├── VOLUME_MAKER.md       # Volume bot setup
│   └── AI_MARKETING.md       # AI marketing (upcoming)
│
├── examples/
│   ├── basic-trader.ts       # Simple trading bot
│   ├── buyback-burn-bot.ts   # Automated buyback/burn
│   ├── volume-maker-bot.ts   # Volume generation
│   └── eliza-agent.ts        # Full Eliza integration
│
└── strategies/
    ├── dca-strategy.ts       # Dollar-cost averaging
    ├── momentum-strategy.ts  # Momentum trading
    └── arbitrage-strategy.ts # Cross-DEX arbitrage
```

---

## 🚀 Quick Start

### 1. Install SDK

```bash
npm install @mayhem/llm-sdk
# or
yarn add @mayhem/llm-sdk
```

### 2. Initialize SDK

```typescript
import { MayhemSDK, LLMConnector } from '@mayhem/llm-sdk';

const sdk = new MayhemSDK({
  network: 'devnet',
  rpcUrl: 'https://api.devnet.solana.com',
  mayhemProgramId: 'MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e',
  controllerProgramId: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
});

await sdk.initialize();
```

### 3. Connect LLM

```typescript
const llm = new LLMConnector({
  provider: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY,
  model: 'anthropic/claude-3.5-sonnet',
});

const agent = await llm.createTradingAgent(sdk);
```

### 4. Start Trading

```typescript
// Autonomous trading
await agent.startTrading({
  tokenMint: 'YOUR_TOKEN_MINT',
  strategy: 'momentum',
  maxRisk: 0.02, // 2% risk per trade
});

// Buyback & burn
await agent.enableBuybackBurn({
  triggerPrice: 0.0001,
  burnPercentage: 50, // Burn 50% of bought tokens
});
```

---

## 🎯 Features

### ✅ Autonomous Trading
- Market analysis via LLM
- Multi-strategy support (DCA, momentum, arbitrage)
- Risk management & stop-loss
- Real-time price monitoring

### ✅ Buyback & Burn
- Automated from creator fees
- Price-triggered buybacks
- Configurable burn percentage
- LP addition support

### ✅ Volume Making
- Natural trading patterns
- Randomized timing
- Spread management
- Market depth maintenance

### 🚧 AI Marketing (Coming Soon)
- Platform analytics (Twitter, Discord, Telegram)
- Engagement metrics tracking
- Autonomous budget allocation
- ROI-optimized campaigns

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [Quickstart](docs/QUICKSTART.md) | Get up and running in 5 minutes |
| [Eliza Integration](docs/ELIZA_INTEGRATION.md) | Connect Eliza AI agents |
| [OpenRouter Setup](docs/OPENROUTER_SETUP.md) | Use OpenRouter LLM providers |
| [Trading Strategies](docs/TRADING_STRATEGIES.md) | Available trading algorithms |
| [Volume Maker](docs/VOLUME_MAKER.md) | Generate organic volume |
| [AI Marketing](docs/AI_MARKETING.md) | Autonomous marketing (upcoming) |

---

## 🔐 Security

- Never expose private keys in code
- Use environment variables for secrets
- Rate limit LLM API calls
- Implement position size limits
- Enable trading halts on anomalies

---

## 🤝 Supported LLM Providers

- ✅ **OpenRouter** (Claude, GPT-4, Llama)
- ✅ **Eliza** (ai16z framework)
- ✅ **OpenAI** (GPT-4, GPT-3.5)
- ✅ **Anthropic** (Claude 3.5 Sonnet)
- ✅ **Custom** (Bring your own model)

---

## 📊 Example Use Cases

### 1. Token Creator
```typescript
// Buyback & burn using 50% of fees
const creator = new CreatorAgent(sdk);
await creator.enableAutoBuyback({
  feePercentage: 50,
  burnRatio: 0.8,
  lpRatio: 0.2,
});
```

### 2. Market Maker
```typescript
// Provide liquidity & earn fees
const mm = new MarketMakerAgent(sdk);
await mm.startMarketMaking({
  spread: 0.01, // 1% spread
  inventory: 1000_000, // Token inventory
});
```

### 3. Arbitrage Bot
```typescript
// Cross-DEX arbitrage
const arb = new ArbitrageAgent(sdk);
await arb.monitor(['raydium', 'orca', 'jupiter']);
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build SDK
npm run build

# Run tests
npm test

# Run example
npm run example:basic-trader
```

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🚨 Disclaimer

This SDK is for educational purposes. Trading cryptocurrencies carries risk. Always test on devnet first. Never risk more than you can afford to lose.
