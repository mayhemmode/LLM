/**
 * LLM Connector - Connect AI agents to Mayhem SDK
 * Supports: OpenRouter, Eliza, OpenAI, Anthropic, Custom LLMs
 */

import { MayhemSDK } from './mayhem-sdk';
import { TradingAgent } from './trading-agent';
import { MarketingAgent } from './marketing-agent';

export interface LLMConfig {
  provider: 'openrouter' | 'eliza' | 'openai' | 'anthropic' | 'custom';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  systemPrompt?: string;
}

export interface LLMResponse {
  action: 'buy' | 'sell' | 'hold' | 'burn' | 'add_lp';
  amount?: number;
  reasoning: string;
  confidence: number;
}

export class LLMConnector {
  private config: LLMConfig;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(config: LLMConfig) {
    this.config = config;
    this.conversationHistory.push({
      role: 'system',
      content: config.systemPrompt || this.getDefaultSystemPrompt(),
    });
  }

  /**
   * Create trading agent connected to LLM
   */
  async createTradingAgent(sdk: MayhemSDK): Promise<TradingAgent> {
    console.log(`🤖 Creating trading agent with ${this.config.provider}`);
    
    return new TradingAgent(sdk, this);
  }

  /**
   * Create marketing agent connected to LLM
   */
  async createMarketingAgent(apiUrl: string): Promise<MarketingAgent> {
    console.log(`📱 Creating marketing agent with ${this.config.provider}`);
    
    return new MarketingAgent(apiUrl, this);
  }

  /**
   * Query LLM for trading decision
   */
  async decideTrade(marketData: any): Promise<LLMResponse> {
    const prompt = this.buildTradingPrompt(marketData);
    
    this.conversationHistory.push({
      role: 'user',
      content: prompt,
    });

    const response = await this.queryLLM();
    
    this.conversationHistory.push({
      role: 'assistant',
      content: JSON.stringify(response),
    });

    return this.parseTradingResponse(response);
  }

  /**
   * Query LLM for marketing decision
   */
  async decideMarketing(platformMetrics: any): Promise<any> {
    const prompt = this.buildMarketingPrompt(platformMetrics);
    
    const response = await this.queryLLM(prompt);
    
    return this.parseMarketingResponse(response);
  }

  /**
   * Send query to LLM provider
   */
  private async queryLLM(customPrompt?: string): Promise<string> {
    const messages = customPrompt 
      ? [{ role: 'user', content: customPrompt }]
      : this.conversationHistory;

    switch (this.config.provider) {
      case 'openrouter':
        return this.queryOpenRouter(messages);
      
      case 'eliza':
        return this.queryEliza(messages);
      
      case 'openai':
        return this.queryOpenAI(messages);
      
      case 'anthropic':
        return this.queryAnthropic(messages);
      
      case 'custom':
        return this.queryCustom(messages);
      
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * OpenRouter API
   */
  private async queryOpenRouter(messages: any[]): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'anthropic/claude-3.5-sonnet',
        messages,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Eliza Framework
   */
  private async queryEliza(messages: any[]): Promise<string> {
    // Connect to Eliza agent via API or direct integration
    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        agentId: this.config.apiKey, // Eliza agent ID
      }),
    });

    const data = await response.json();
    return data.response;
  }

  /**
   * OpenAI API
   */
  private async queryOpenAI(messages: any[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Anthropic Claude API
   */
  private async queryAnthropic(messages: any[]): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: messages.filter(m => m.role !== 'system'),
        system: messages.find(m => m.role === 'system')?.content,
      }),
    });

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Custom LLM endpoint
   */
  private async queryCustom(messages: any[]): Promise<string> {
    const response = await fetch(this.config.baseUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();
    return data.response;
  }

  /**
   * Build trading prompt
   */
  private buildTradingPrompt(marketData: any): string {
    return `
Analyze the following market data and decide on trading action:

Token: ${marketData.symbol}
Current Price: $${marketData.price}
24h Volume: $${marketData.volume24h}
24h Price Change: ${marketData.priceChange24h}%
Market Cap: $${marketData.marketCap}
Holders: ${marketData.holders}

Recent Transactions:
${marketData.recentTxs?.map((tx: any) => `- ${tx.type}: ${tx.amount} @ $${tx.price}`).join('\n')}

Respond in JSON format:
{
  "action": "buy" | "sell" | "hold" | "burn" | "add_lp",
  "amount": <number in SOL>,
  "reasoning": "<your analysis>",
  "confidence": <0-1>
}
    `.trim();
  }

  /**
   * Build marketing prompt
   */
  private buildMarketingPrompt(metrics: any): string {
    return `
Analyze platform metrics and allocate marketing budget:

Available Budget: $${metrics.budget}

Platform Performance (Last 7 days):
- Twitter: ${metrics.twitter.engagement} engagement, ${metrics.twitter.reach} reach
- Discord: ${metrics.discord.activeUsers} active users, ${metrics.discord.messages} messages
- Telegram: ${metrics.telegram.members} members, ${metrics.telegram.activity}% activity

Recommend budget allocation and strategies in JSON format:
{
  "allocations": [
    { "platform": "twitter", "amount": <USD>, "strategy": "<description>" },
    { "platform": "discord", "amount": <USD>, "strategy": "<description>" }
  ],
  "reasoning": "<your analysis>"
}
    `.trim();
  }

  /**
   * Parse LLM trading response
   */
  private parseTradingResponse(response: string): LLMResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        action: parsed.action,
        amount: parsed.amount,
        reasoning: parsed.reasoning,
        confidence: parsed.confidence,
      };
    } catch (error) {
      // Fallback if LLM doesn't return valid JSON
      return {
        action: 'hold',
        reasoning: response,
        confidence: 0.5,
      };
    }
  }

  /**
   * Parse LLM marketing response
   */
  private parseMarketingResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        allocations: [],
        reasoning: response,
      };
    }
  }

  /**
   * Default system prompt for trading
   */
  private getDefaultSystemPrompt(): string {
    return `
You are an expert cryptocurrency trading AI for the Mayhem protocol on Solana.

Your responsibilities:
1. Analyze market data and make informed trading decisions
2. Manage risk by limiting position sizes
3. Execute buybacks when prices are favorable
4. Decide when to burn tokens vs add to LP
5. Provide clear reasoning for all decisions

Guidelines:
- Never risk more than 2% of portfolio on a single trade
- Prefer gradual accumulation over large market orders
- Consider market sentiment and volume trends
- Prioritize long-term value over short-term gains
- Always provide JSON-formatted responses
    `.trim();
  }
}

export default LLMConnector;
