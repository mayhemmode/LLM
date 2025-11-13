/**
 * Basic Trading Bot Example
 * 
 * Simple autonomous trading bot that:
 * - Analyzes token every 5 minutes
 * - Makes buy/sell decisions via LLM
 * - Executes trades automatically
 */

import { MayhemSDK, LLMConnector } from '@mayhem/llm-sdk';
import { Keypair } from '@solana/web3.js';
import * as dotenv from 'dotenv';
import bs58 from 'bs58';

dotenv.config();

async function main() {
  console.log('🚀 Starting Basic Trading Bot\n');

  // 1. Load wallet
  const wallet = Keypair.fromSecretKey(
    bs58.decode(process.env.WALLET_PRIVATE_KEY!)
  );
  console.log('💼 Wallet:', wallet.publicKey.toBase58());

  // 2. Initialize Mayhem SDK
  const sdk = new MayhemSDK({
    network: 'devnet',
    rpcUrl: process.env.RPC_URL || 'https://api.devnet.solana.com',
    mayhemProgramId: process.env.MAYHEM_PROGRAM_ID!,
    controllerProgramId: process.env.CONTROLLER_PROGRAM_ID!,
    wallet,
  });

  await sdk.initialize();
  console.log('✅ Connected to Mayhem Protocol\n');

  // 3. Setup LLM
  const llm = new LLMConnector({
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY!,
    model: 'anthropic/claude-3-haiku', // Fast & cheap
    systemPrompt: `
You are a conservative crypto trading bot. 
Analyze market data and make safe trading decisions.
Prefer holding over risky trades.
Max 2% risk per trade.
Always provide JSON responses.
    `.trim(),
  });

  console.log('🤖 LLM Connected: OpenRouter\n');

  // 4. Create trading agent
  const agent = await llm.createTradingAgent(sdk);

  // 5. Start trading with conservative settings
  await agent.startTrading({
    tokenMint: process.env.TOKEN_MINT!,
    strategy: 'dca', // Dollar-cost averaging
    maxRisk: 0.02,   // 2% max risk
    stopLoss: 20,    // 20% stop loss
    takeProfit: 50,  // 50% take profit
  });

  console.log('📊 Trading Configuration:');
  console.log('   Token:', process.env.TOKEN_MINT);
  console.log('   Strategy: DCA');
  console.log('   Max Risk: 2%');
  console.log('   Stop Loss: 20%');
  console.log('   Take Profit: 50%\n');

  console.log('✅ Bot is now running!');
  console.log('💡 Checking market every 5 minutes');
  console.log('⌛ Press Ctrl+C to stop\n');

  // 6. Monitor status
  setInterval(() => {
    const status = agent.getStatus();
    console.log('📈 Status:', status.isRunning ? 'Active' : 'Paused');
  }, 60000); // Every minute

  // 7. Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down...');
    agent.stopTrading();
    await sdk.disconnect();
    console.log('✅ Bot stopped safely');
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
