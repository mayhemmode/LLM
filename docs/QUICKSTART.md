# Mayhem LLM SDK - Quick Start

Get your AI trading agent running in 5 minutes.

## Prerequisites

- Node.js 18+
- Solana wallet with devnet SOL
- LLM API key (OpenRouter, OpenAI, or Anthropic)

## Installation

```bash
npm install @mayhem/llm-sdk @solana/web3.js @coral-xyz/anchor
```

## Environment Setup

Create `.env` file:

```bash
# Solana Configuration
SOLANA_NETWORK=devnet
RPC_URL=https://api.devnet.solana.com

# Wallet (use devnet wallet only!)
WALLET_PRIVATE_KEY=your_base58_private_key

# LLM Provider (choose one)
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# Mayhem Programs
MAYHEM_PROGRAM_ID=MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e
CONTROLLER_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

# Your Token
TOKEN_MINT=your_token_mint_address
```

## Basic Trading Bot

```typescript
import { MayhemSDK, LLMConnector } from '@mayhem/llm-sdk';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

async function main() {
  // 1. Initialize SDK
  const wallet = Keypair.fromSecretKey(
    bs58.decode(process.env.WALLET_PRIVATE_KEY!)
  );

  const sdk = new MayhemSDK({
    network: 'devnet',
    rpcUrl: process.env.RPC_URL!,
    mayhemProgramId: process.env.MAYHEM_PROGRAM_ID!,
    controllerProgramId: process.env.CONTROLLER_PROGRAM_ID!,
    wallet,
  });

  await sdk.initialize();

  // 2. Connect LLM
  const llm = new LLMConnector({
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY!,
    model: 'anthropic/claude-3.5-sonnet',
  });

  // 3. Create trading agent
  const agent = await llm.createTradingAgent(sdk);

  // 4. Start trading
  await agent.startTrading({
    tokenMint: process.env.TOKEN_MINT!,
    strategy: 'momentum',
    maxRisk: 0.02, // 2% max risk per trade
  });

  console.log('🤖 Trading agent started!');
  console.log('Press Ctrl+C to stop');
}

main().catch(console.error);
```

## Run Your Bot

```bash
node trading-bot.js
```

## Enable Buyback & Burn

```typescript
// Add after creating agent
await agent.enableBuybackBurn({
  enabled: true,
  triggerPrice: 0.0001, // Buy when price < $0.0001
  burnPercentage: 50,   // Burn 50% of bought tokens
  lpPercentage: 50,     // Add 50% to LP
});
```

## Monitor Performance

```typescript
// Get agent status
const status = agent.getStatus();
console.log('Agent Status:', status);

// Get token price
const price = await sdk.getTokenPrice(tokenMint);
console.log('Current Price:', price);

// Get 24h volume
const volume = await sdk.getVolume24h(tokenMint);
console.log('24h Volume:', volume);
```

## Stop Trading

```typescript
// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Stopping agent...');
  agent.stopTrading();
  await sdk.disconnect();
  process.exit(0);
});
```

## Next Steps

- [Eliza Integration](ELIZA_INTEGRATION.md) - Connect Eliza AI agents
- [Trading Strategies](TRADING_STRATEGIES.md) - Advanced trading algorithms
- [Volume Maker](VOLUME_MAKER.md) - Generate organic volume
- [AI Marketing](AI_MARKETING.md) - Autonomous marketing (coming soon)

## Troubleshooting

### "Insufficient SOL"
Get devnet SOL:
```bash
solana airdrop 2 YOUR_WALLET_ADDRESS
```

### "Program not found"
Ensure you're on the correct network (devnet vs mainnet).

### "LLM API error"
Check your API key and rate limits.

## Support

- Discord: [discord.gg/mayhem](#)
- Twitter: [@MayhemProtocol](#)
- Docs: [docs.mayhem.io](#)
