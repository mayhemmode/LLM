/**
 * Trading Agent - Autonomous trading using LLM decisions
 */

import { MayhemSDK, TradeParams } from './mayhem-sdk';
import { LLMConnector, LLMResponse } from './llm-connector';
import { PublicKey } from '@solana/web3.js';

export interface TradingConfig {
  tokenMint: string;
  strategy: 'dca' | 'momentum' | 'arbitrage' | 'market-making';
  maxRisk: number; // Max % of portfolio per trade
  stopLoss?: number; // Stop loss percentage
  takeProfit?: number; // Take profit percentage
}

export interface BuybackConfig {
  enabled: boolean;
  triggerPrice?: number; // Buy when price falls below
  burnPercentage: number; // 0-100
  lpPercentage?: number; // 0-100
}

export class TradingAgent {
  private sdk: MayhemSDK;
  private llm: LLMConnector;
  private isRunning: boolean = false;
  private config: TradingConfig | null = null;
  private buybackConfig: BuybackConfig | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(sdk: MayhemSDK, llm: LLMConnector) {
    this.sdk = sdk;
    this.llm = llm;
  }

  /**
   * Start autonomous trading
   */
  async startTrading(config: TradingConfig): Promise<void> {
    if (this.isRunning) {
      throw new Error('Agent already running');
    }

    this.config = config;
    this.isRunning = true;

    console.log(`🤖 Starting ${config.strategy} trading for ${config.tokenMint}`);
    
    // Start monitoring loop
    this.checkInterval = setInterval(
      () => this.analyzeAndTrade(),
      30000 // Check every 30 seconds
    );

    // Initial check
    await this.analyzeAndTrade();
  }

  /**
   * Stop trading
   */
  stopTrading(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('⏸️  Trading stopped');
  }

  /**
   * Enable buyback and burn
   */
  enableBuybackBurn(config: BuybackConfig): void {
    this.buybackConfig = config;
    console.log(`🔥 Buyback enabled: ${config.burnPercentage}% burn`);
  }

  /**
   * Analyze market and execute trades
   */
  private async analyzeAndTrade(): Promise<void> {
    if (!this.config) return;

    try {
      // Gather market data
      const marketData = await this.getMarketData(this.config.tokenMint);
      
      // Query LLM for decision
      const decision = await this.llm.decideTrade(marketData);
      
      console.log(`💭 LLM Decision: ${decision.action} (${decision.confidence * 100}% confident)`);
      console.log(`📝 Reasoning: ${decision.reasoning}`);

      // Execute decision
      if (decision.confidence > 0.7) {
        await this.executeDecision(decision);
      } else {
        console.log('⚠️  Low confidence - skipping trade');
      }

      // Check buyback conditions
      if (this.buybackConfig?.enabled) {
        await this.checkBuyback(marketData);
      }
    } catch (error) {
      console.error('❌ Trading error:', error);
    }
  }

  /**
   * Get current market data
   */
  private async getMarketData(tokenMint: string): Promise<any> {
    const mint = new PublicKey(tokenMint);
    const tokenInfo = await this.sdk.getTokenInfo(tokenMint);
    const price = await this.sdk.getTokenPrice(mint);
    const volume24h = await this.sdk.getVolume24h(mint);

    return {
      symbol: tokenInfo.symbol,
      price,
      volume24h,
      priceChange24h: 0, // TODO: Calculate from history
      marketCap: price * tokenInfo.supply,
      holders: 0, // TODO: Fetch holder count
      recentTxs: [], // TODO: Fetch recent transactions
    };
  }

  /**
   * Execute trading decision
   */
  private async executeDecision(decision: LLMResponse): Promise<void> {
    if (!this.config) return;

    const mint = new PublicKey(this.config.tokenMint);

    switch (decision.action) {
      case 'buy':
        if (decision.amount) {
          await this.executeBuy(mint, decision.amount);
        }
        break;

      case 'sell':
        if (decision.amount) {
          await this.executeSell(mint, decision.amount);
        }
        break;

      case 'burn':
        if (decision.amount) {
          await this.executeBurn(mint, decision.amount);
        }
        break;

      case 'add_lp':
        if (decision.amount) {
          await this.sdk.addLiquidityFromFees(mint, decision.amount);
        }
        break;

      case 'hold':
        console.log('💤 Holding position');
        break;
    }
  }

  /**
   * Execute buy order
   */
  private async executeBuy(tokenMint: PublicKey, amount: number): Promise<void> {
    console.log(`💰 Buying ${amount} SOL worth of tokens`);
    
    await this.sdk.trade({
      tokenMint,
      amount,
      side: 'buy',
      slippage: 0.01, // 1% slippage
    });
  }

  /**
   * Execute sell order
   */
  private async executeSell(tokenMint: PublicKey, amount: number): Promise<void> {
    console.log(`📤 Selling ${amount} tokens`);
    
    await this.sdk.trade({
      tokenMint,
      amount,
      side: 'sell',
      slippage: 0.01,
    });
  }

  /**
   * Execute burn
   */
  private async executeBurn(tokenMint: PublicKey, amount: number): Promise<void> {
    console.log(`🔥 Burning ${amount} tokens`);
    
    // Call controller burn
    // await this.sdk.burnTokens(tokenMint, amount);
  }

  /**
   * Check buyback conditions
   */
  private async checkBuyback(marketData: any): Promise<void> {
    if (!this.buybackConfig || !this.config) return;

    const shouldBuyback = 
      this.buybackConfig.triggerPrice && 
      marketData.price < this.buybackConfig.triggerPrice;

    if (shouldBuyback) {
      console.log('🎯 Buyback triggered!');
      
      // Collect fees
      const feeAmount = await this.sdk.collectFees();
      
      if (feeAmount > 0) {
        // Execute buyback
        await this.sdk.buybackAndBurn({
          tokenMint: new PublicKey(this.config.tokenMint),
          solAmount: feeAmount,
          burnPercentage: this.buybackConfig.burnPercentage,
        });
      }
    }
  }

  /**
   * Get agent status
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      config: this.config,
      buybackEnabled: this.buybackConfig?.enabled || false,
    };
  }
}

export default TradingAgent;
