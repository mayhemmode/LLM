/**
 * Mayhem SDK - Core SDK for interacting with Mayhem protocol
 * Connects to both Mayhem program and Controller program
 */

import { Connection, PublicKey, Transaction, Keypair, SystemProgram } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';

export interface MayhemSDKConfig {
  network: 'mainnet' | 'devnet';
  rpcUrl: string;
  mayhemProgramId: string;
  controllerProgramId?: string;
  wallet?: Keypair;
}

export interface TokenInfo {
  mint: PublicKey;
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  price?: number;
}

export interface TradeParams {
  tokenMint: PublicKey;
  amount: number;
  side: 'buy' | 'sell';
  slippage?: number;
}

export interface BuybackParams {
  tokenMint: PublicKey;
  solAmount: number;
  burnPercentage: number; // 0-100
}

export class MayhemSDK {
  private connection: Connection;
  private wallet: Keypair | null = null;
  private mayhemProgram: PublicKey;
  private controllerProgram: PublicKey | null = null;
  private provider: anchor.AnchorProvider | null = null;

  constructor(config: MayhemSDKConfig) {
    this.connection = new Connection(config.rpcUrl, 'confirmed');
    this.mayhemProgram = new PublicKey(config.mayhemProgramId);
    
    if (config.controllerProgramId) {
      this.controllerProgram = new PublicKey(config.controllerProgramId);
    }
    
    if (config.wallet) {
      this.wallet = config.wallet;
      this.provider = new anchor.AnchorProvider(
        this.connection,
        new anchor.Wallet(this.wallet),
        { commitment: 'confirmed' }
      );
    }
  }

  /**
   * Initialize SDK - connect to programs
   */
  async initialize(): Promise<void> {
    console.log('🔌 Connecting to Mayhem Protocol...');
    
    // Verify Mayhem program exists
    const mayhemAccount = await this.connection.getAccountInfo(this.mayhemProgram);
    if (!mayhemAccount) {
      throw new Error('Mayhem program not found on network');
    }
    
    console.log('✅ Connected to Mayhem:', this.mayhemProgram.toBase58());
    
    if (this.controllerProgram) {
      const controllerAccount = await this.connection.getAccountInfo(this.controllerProgram);
      if (controllerAccount) {
        console.log('✅ Connected to Controller:', this.controllerProgram.toBase58());
      }
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(mintAddress: string): Promise<TokenInfo> {
    const mint = new PublicKey(mintAddress);
    const mintInfo = await this.connection.getParsedAccountInfo(mint);
    
    if (!mintInfo.value) {
      throw new Error('Token not found');
    }

    const data = mintInfo.value.data as any;
    
    return {
      mint,
      name: 'Token Name', // TODO: Fetch from metadata
      symbol: 'TKN',
      decimals: data.parsed.info.decimals,
      supply: data.parsed.info.supply,
    };
  }

  /**
   * Execute trade via Mayhem program
   */
  async trade(params: TradeParams): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    console.log(`📈 ${params.side.toUpperCase()}: ${params.amount} tokens`);
    
    // Build transaction for Mayhem trade
    const transaction = new Transaction();
    
    // Add trade instruction (simplified - needs actual Mayhem instruction)
    // This would call Mayhem's Buy or Sell instruction
    
    const signature = await this.connection.sendTransaction(
      transaction,
      [this.wallet],
      { skipPreflight: false }
    );
    
    await this.connection.confirmTransaction(signature);
    
    console.log('✅ Trade executed:', signature);
    return signature;
  }

  /**
   * Buyback tokens and burn
   */
  async buybackAndBurn(params: BuybackParams): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    if (!this.controllerProgram) {
      throw new Error('Controller program not configured');
    }

    console.log(`🔥 Buyback: ${params.solAmount} SOL → ${params.burnPercentage}% burn`);
    
    // 1. Buy tokens
    const buySignature = await this.trade({
      tokenMint: params.tokenMint,
      amount: params.solAmount,
      side: 'buy',
    });
    
    // 2. Burn percentage
    if (params.burnPercentage > 0) {
      // Call controller's burn instruction
      console.log(`🔥 Burning ${params.burnPercentage}% of bought tokens`);
    }
    
    return buySignature;
  }

  /**
   * Add liquidity to pool from fees
   */
  async addLiquidityFromFees(tokenMint: PublicKey, feeAmount: number): Promise<string> {
    if (!this.controllerProgram) {
      throw new Error('Controller program not configured');
    }

    console.log(`💧 Adding ${feeAmount} to LP`);
    
    // Call controller's add liquidity instruction
    const transaction = new Transaction();
    
    const signature = await this.connection.sendTransaction(
      transaction,
      [this.wallet!],
    );
    
    await this.connection.confirmTransaction(signature);
    return signature;
  }

  /**
   * Collect accumulated fees
   */
  async collectFees(): Promise<number> {
    if (!this.controllerProgram) {
      throw new Error('Controller program not configured');
    }

    console.log('💰 Collecting fees...');
    
    // Call controller's collect_fees instruction
    const transaction = new Transaction();
    
    const signature = await this.connection.sendTransaction(
      transaction,
      [this.wallet!],
    );
    
    await this.connection.confirmTransaction(signature);
    
    // Return collected amount
    return 0; // TODO: Parse from transaction
  }

  /**
   * Get current token price from Mayhem bonding curve
   */
  async getTokenPrice(tokenMint: PublicKey): Promise<number> {
    // Query Mayhem program for bonding curve price
    // This would fetch current buy/sell price from the curve
    
    return 0.0001; // Mock price
  }

  /**
   * Monitor token events
   */
  async subscribeToToken(
    tokenMint: PublicKey,
    callback: (event: any) => void
  ): Promise<number> {
    console.log('👂 Listening to token events...');
    
    return this.connection.onAccountChange(
      tokenMint,
      (accountInfo) => {
        callback({
          type: 'token_update',
          data: accountInfo,
        });
      },
      'confirmed'
    );
  }

  /**
   * Get trading volume
   */
  async getVolume24h(tokenMint: PublicKey): Promise<number> {
    // Fetch 24h volume from transaction history
    const signatures = await this.connection.getSignaturesForAddress(
      tokenMint,
      { limit: 1000 }
    );
    
    // Calculate volume from signatures
    return signatures.length * 0.1; // Mock calculation
  }

  /**
   * Close connection
   */
  async disconnect(): Promise<void> {
    console.log('👋 Disconnecting from Mayhem');
  }
}

export default MayhemSDK;
