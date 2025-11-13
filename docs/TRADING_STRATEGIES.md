# Trading Strategies

Comprehensive guide to available trading strategies for Mayhem LLM agents.

## Overview

The SDK supports multiple trading strategies, each optimized for different market conditions and risk profiles.

## Available Strategies

### 1. Dollar-Cost Averaging (DCA)

**Best for**: Long-term accumulation, volatile markets

```typescript
await agent.startTrading({
  tokenMint: 'YOUR_TOKEN',
  strategy: 'dca',
  maxRisk: 0.01,
  
  // DCA-specific settings
  dcaAmount: 0.1,      // Buy 0.1 SOL worth every interval
  dcaInterval: 86400,  // Daily (in seconds)
});
```

**How it works**:
- Buys fixed amount at regular intervals
- Averages out price volatility
- Ignores short-term price movements
- Focuses on long-term position building

**Pros**:
- ✅ Simple and predictable
- ✅ Reduces timing risk
- ✅ Works in any market

**Cons**:
- ❌ May buy at peaks
- ❌ Slower accumulation
- ❌ Misses dip opportunities

---

### 2. Momentum Trading

**Best for**: Trending markets, active trading

```typescript
await agent.startTrading({
  tokenMint: 'YOUR_TOKEN',
  strategy: 'momentum',
  maxRisk: 0.02,
  
  // Momentum settings
  trendPeriod: 14,        // 14-period trend analysis
  momentumThreshold: 0.05, // 5% momentum required
  exitOnReversal: true,   // Exit when trend reverses
});
```

**How it works**:
- Analyzes price trends and volume
- Enters when strong momentum detected
- Rides the trend until reversal
- Uses technical indicators (RSI, MACD)

**Indicators used**:
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Volume analysis
- Moving averages

**Pros**:
- ✅ Captures strong moves
- ✅ Higher profit potential
- ✅ Adapts to market

**Cons**:
- ❌ Late entries
- ❌ False signals
- ❌ Requires liquidity

---

### 3. Arbitrage

**Best for**: Market inefficiencies, multiple DEXs

```typescript
await agent.startTrading({
  tokenMint: 'YOUR_TOKEN',
  strategy: 'arbitrage',
  maxRisk: 0.01,
  
  // Arbitrage settings
  exchanges: ['raydium', 'orca', 'jupiter'],
  minSpread: 0.005,  // Minimum 0.5% spread
  maxSlippage: 0.01, // Max 1% slippage
});
```

**How it works**:
- Monitors prices across DEXs
- Identifies price differences
- Executes buy on cheap DEX, sell on expensive DEX
- Profits from price inefficiencies

**Pros**:
- ✅ Low risk (market-neutral)
- ✅ Consistent small gains
- ✅ High win rate

**Cons**:
- ❌ Requires capital on multiple DEXs
- ❌ Transaction fees eat profits
- ❌ Competition from bots

---

### 4. Market Making

**Best for**: Providing liquidity, earning fees

```typescript
await agent.startTrading({
  tokenMint: 'YOUR_TOKEN',
  strategy: 'market-making',
  maxRisk: 0.05,
  
  // Market making settings
  spread: 0.01,      // 1% spread
  depth: 5,          // 5 price levels
  orderSize: 100,    // $100 per level
  rebalanceTime: 300, // Rebalance every 5 min
});
```

**How it works**:
- Places buy and sell orders
- Maintains spread between orders
- Earns fees from price oscillations
- Rebalances inventory regularly

**Pros**:
- ✅ Earns trading fees
- ✅ Provides liquidity
- ✅ Works in sideways markets

**Cons**:
- ❌ Inventory risk
- ❌ Requires significant capital
- ❌ Vulnerable to trends

---

## Strategy Comparison

| Strategy | Risk | Return | Frequency | Capital | Complexity |
|----------|------|---------|-----------|---------|------------|
| DCA | Low | Low-Med | Daily | Any | Simple |
| Momentum | Medium | High | Hours | Medium | Medium |
| Arbitrage | Low | Low | Minutes | High | Complex |
| Market Making | Medium | Medium | Seconds | High | Complex |

---

## Advanced Configuration

### Custom Strategy

Create your own strategy:

```typescript
import { Strategy } from '@mayhem/llm-sdk';

class CustomStrategy extends Strategy {
  async analyze(marketData: any): Promise<Decision> {
    // Your analysis logic
    
    if (/* buy condition */) {
      return {
        action: 'buy',
        amount: /* calculate amount */,
        confidence: /* 0-1 */,
      };
    }
    
    return { action: 'hold', confidence: 1.0 };
  }
}

// Use custom strategy
const agent = await llm.createTradingAgent(sdk);
agent.setStrategy(new CustomStrategy());
```

---

## Risk Management

### Position Sizing

```typescript
// Fixed percentage risk
const maxRisk = 0.02; // 2% of portfolio

// Kelly Criterion
const kellyCriterion = (winRate - lossRate) / winRate;
const positionSize = portfolio * kellyCriterion * 0.25; // Quarter Kelly

// Volatility-adjusted
const volatility = calculateVolatility(prices);
const size = baseSize / volatility;
```

### Stop Loss & Take Profit

```typescript
await agent.startTrading({
  tokenMint: 'YOUR_TOKEN',
  strategy: 'momentum',
  
  // Risk management
  stopLoss: 20,      // 20% stop loss
  takeProfit: 50,    // 50% take profit
  trailingStop: 10,  // 10% trailing stop
});
```

### Portfolio Limits

```typescript
// Max allocation per token
const maxAllocation = 0.2; // 20% of portfolio

// Diversification
const maxTokens = 5; // Max 5 tokens

// Exposure limits
const maxExposure = 0.5; // 50% max in risky assets
```

---

## Performance Tracking

### Metrics to Monitor

```typescript
const metrics = {
  // Return metrics
  totalReturn: 0.25,      // 25% total return
  annualizedReturn: 1.5,  // 150% APR
  sharpeRatio: 2.1,       // Risk-adjusted return
  
  // Risk metrics
  maxDrawdown: 0.15,      // Max 15% drawdown
  volatility: 0.3,        // 30% annualized volatility
  
  // Trading metrics
  winRate: 0.65,          // 65% win rate
  avgWin: 0.08,           // 8% avg win
  avgLoss: 0.04,          // 4% avg loss
  profitFactor: 2.0,      // Win/loss ratio
  
  // Execution metrics
  tradesExecuted: 120,
  avgSlippage: 0.005,     // 0.5% avg slippage
  totalFees: 0.02,        // 2% total fees
};
```

### Backtesting

```typescript
import { Backtest } from '@mayhem/llm-sdk';

const backtest = new Backtest({
  strategy: 'momentum',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  initialCapital: 1000,
});

const results = await backtest.run();

console.log('Backtest Results:');
console.log('Total Return:', results.totalReturn);
console.log('Max Drawdown:', results.maxDrawdown);
console.log('Sharpe Ratio:', results.sharpeRatio);
console.log('Win Rate:', results.winRate);
```

---

## Best Practices

1. **Start Small**: Test with small amounts
2. **Diversify**: Use multiple strategies
3. **Monitor**: Track performance daily
4. **Adjust**: Adapt to market conditions
5. **Risk Management**: Always use stop losses
6. **Backtest**: Test before deploying
7. **Paper Trade**: Simulate first
8. **Review**: Analyze losing trades

---

## Example: Multi-Strategy Portfolio

```typescript
// Conservative DCA (40% allocation)
const dcaAgent = await llm.createTradingAgent(sdk);
await dcaAgent.startTrading({
  strategy: 'dca',
  maxRisk: 0.01,
  dcaAmount: 0.4, // 40% of budget
});

// Momentum trading (40% allocation)
const momentumAgent = await llm.createTradingAgent(sdk);
await momentumAgent.startTrading({
  strategy: 'momentum',
  maxRisk: 0.02,
  allocation: 0.4,
});

// Market making (20% allocation)
const mmAgent = await llm.createTradingAgent(sdk);
await mmAgent.startTrading({
  strategy: 'market-making',
  maxRisk: 0.01,
  allocation: 0.2,
});
```

---

## Resources

- [Investopedia: Trading Strategies](https://www.investopedia.com/trading-4427765)
- [Quantitative Trading](https://www.quantstart.com/)
- [Crypto Trading Strategies](https://www.binance.com/en/academy)

---

**Disclaimer**: Past performance does not guarantee future results. Trading carries risk of loss. Only trade with capital you can afford to lose.
