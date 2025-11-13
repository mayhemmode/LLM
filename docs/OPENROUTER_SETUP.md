# OpenRouter Integration

Use [OpenRouter](https://openrouter.ai) to access multiple LLM providers (Claude, GPT-4, Llama) through a single API.

## Why OpenRouter?

- **Multiple Models**: Access Claude, GPT-4, Llama, Mistral, and more
- **Best Pricing**: Competitive rates across providers
- **Fallbacks**: Automatic fallback if primary model unavailable
- **No Lock-in**: Switch models without code changes
- **Credits**: Pay-as-you-go, no subscriptions

## Setup

### 1. Get API Key

1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up / Login
3. Go to [Keys](https://openrouter.ai/keys)
4. Create new API key
5. Add credits ($5-10 recommended for testing)

### 2. Configure SDK

```typescript
import { MayhemSDK, LLMConnector } from '@mayhem/llm-sdk';

const llm = new LLMConnector({
  provider: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: 'anthropic/claude-3.5-sonnet', // Recommended
});
```

## Recommended Models

### For Trading (High Intelligence)

**Claude 3.5 Sonnet** (Recommended)
```typescript
model: 'anthropic/claude-3.5-sonnet'
```
- **Cost**: ~$0.003 per decision
- **Speed**: ~2 seconds
- **Quality**: Excellent reasoning
- **Best for**: Complex trading strategies

**GPT-4 Turbo**
```typescript
model: 'openai/gpt-4-turbo'
```
- **Cost**: ~$0.01 per decision
- **Speed**: ~3 seconds
- **Quality**: Excellent
- **Best for**: Multi-factor analysis

### For Volume Making (Speed + Cost)

**Claude 3 Haiku**
```typescript
model: 'anthropic/claude-3-haiku'
```
- **Cost**: ~$0.0003 per decision
- **Speed**: ~1 second
- **Quality**: Good
- **Best for**: High-frequency decisions

**GPT-3.5 Turbo**
```typescript
model: 'openai/gpt-3.5-turbo'
```
- **Cost**: ~$0.0005 per decision
- **Speed**: ~1 second
- **Quality**: Good
- **Best for**: Simple trading logic

### For Marketing (Creativity)

**Claude 3 Opus**
```typescript
model: 'anthropic/claude-3-opus'
```
- **Cost**: ~$0.015 per request
- **Speed**: ~4 seconds
- **Quality**: Excellent creativity
- **Best for**: Marketing copy generation

## Model Comparison

| Model | Cost/1K calls | Speed | Reasoning | Best Use |
|-------|---------------|-------|-----------|----------|
| Claude 3.5 Sonnet | $3 | Fast | ⭐⭐⭐⭐⭐ | Trading |
| GPT-4 Turbo | $10 | Medium | ⭐⭐⭐⭐⭐ | Analysis |
| Claude 3 Haiku | $0.30 | Very Fast | ⭐⭐⭐ | Volume |
| GPT-3.5 Turbo | $0.50 | Very Fast | ⭐⭐⭐ | Volume |
| Llama 3 70B | $0.60 | Fast | ⭐⭐⭐⭐ | Budget |

## Advanced Configuration

### Model Fallbacks

```typescript
const llm = new LLMConnector({
  provider: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: 'anthropic/claude-3.5-sonnet',
  
  // OpenRouter-specific config
  baseUrl: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': 'https://yourapp.com',
    'X-Title': 'Mayhem Trading Bot',
  },
  
  // Fallback models
  fallbacks: [
    'anthropic/claude-3-haiku',
    'openai/gpt-3.5-turbo'
  ],
});
```

### Rate Limiting

```typescript
// Limit calls per minute
const rateLimiter = {
  maxCallsPerMinute: 60,
  maxCallsPerHour: 1000,
};

llm.setRateLimits(rateLimiter);
```

### Caching Responses

```typescript
// Cache trading decisions for same market conditions
const cache = new LRUCache({
  max: 100,
  ttl: 60000, // 1 minute
});

llm.setCache(cache);
```

## Cost Optimization

### 1. Smart Model Selection

```typescript
function selectModel(taskType: string): string {
  switch (taskType) {
    case 'complex_analysis':
      return 'anthropic/claude-3.5-sonnet';
    
    case 'quick_decision':
      return 'anthropic/claude-3-haiku';
    
    case 'volume_making':
      return 'openai/gpt-3.5-turbo';
    
    default:
      return 'anthropic/claude-3.5-sonnet';
  }
}

const llm = new LLMConnector({
  provider: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: selectModel('trading'),
});
```

### 2. Batch Decisions

```typescript
// Analyze multiple tokens in one call
const analysis = await llm.decideTrade({
  tokens: [tokenA, tokenB, tokenC],
  mode: 'batch',
});

// ~$0.003 instead of $0.009
```

### 3. Reduce Frequency

```typescript
// Check market every 5 minutes instead of 1 minute
const checkInterval = 300000; // 5 minutes

// Saves ~80% on API costs
```

### 4. Use Cheaper Models for Simple Tasks

```typescript
// Volume making: Use GPT-3.5
const volumeMakerLLM = new LLMConnector({
  provider: 'openrouter',
  model: 'openai/gpt-3.5-turbo',
});

// Complex trading: Use Claude 3.5
const tradingLLM = new LLMConnector({
  provider: 'openrouter',
  model: 'anthropic/claude-3.5-sonnet',
});
```

## Monitoring Usage

```typescript
// Track API costs
let totalCalls = 0;
let totalCost = 0;

llm.on('request', (model, cost) => {
  totalCalls++;
  totalCost += cost;
  
  console.log(`Calls: ${totalCalls}, Cost: $${totalCost.toFixed(2)}`);
  
  if (totalCost > 10) {
    console.warn('⚠️  Daily budget exceeded!');
    llm.pause();
  }
});
```

## Example: Multi-Model Setup

```typescript
import { MayhemSDK, LLMConnector } from '@mayhem/llm-sdk';

// High-quality model for important decisions
const premiumLLM = new LLMConnector({
  provider: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: 'anthropic/claude-3.5-sonnet',
});

// Fast model for frequent checks
const fastLLM = new LLMConnector({
  provider: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: 'anthropic/claude-3-haiku',
});

const sdk = new MayhemSDK({ /* ... */ });

// Use premium for complex analysis
const tradingAgent = await premiumLLM.createTradingAgent(sdk);

// Use fast for volume making
const volumeAgent = await fastLLM.createVolumeAgent(sdk);

await tradingAgent.startTrading({
  tokenMint: 'YOUR_TOKEN',
  strategy: 'momentum',
});

await volumeAgent.startVolumemaking({
  dailyTarget: 10000,
});
```

## Troubleshooting

### "Insufficient credits"
Add more credits at [openrouter.ai/credits](https://openrouter.ai/credits)

### "Model not available"
Try fallback model:
```typescript
model: 'anthropic/claude-3-haiku'
```

### "Rate limit exceeded"
Reduce request frequency or upgrade plan

## Cost Estimation

### Daily Trading Bot
- **Model**: Claude 3.5 Sonnet
- **Checks**: Every 5 minutes (288/day)
- **Cost**: ~$0.86/day ($26/month)

### Volume Making Bot
- **Model**: GPT-3.5 Turbo
- **Trades**: 100/day
- **Cost**: ~$0.05/day ($1.50/month)

### Marketing Bot
- **Model**: Claude 3 Opus
- **Decisions**: 3/day
- **Cost**: ~$0.05/day ($1.50/month)

**Total**: ~$29/month for all bots

## Resources

- [OpenRouter Dashboard](https://openrouter.ai/dashboard)
- [Model Pricing](https://openrouter.ai/docs#models)
- [API Documentation](https://openrouter.ai/docs)
- [Discord Support](https://discord.gg/openrouter)
