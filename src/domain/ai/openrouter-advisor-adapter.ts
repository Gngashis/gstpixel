import { AiComplianceReview, OpenRouterModelChoice } from './types';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export const RECOMMENDED_MODELS = {
  FAST_ACCURATE: 'meta-llama/llama-3.3-70b-instruct',
  DEEP_REASONING: 'deepseek/deepseek-r1-0528',
  BALANCED: 'openai/gpt-4o-mini',
  ENTERPRISE_ANALYSIS: 'anthropic/claude-sonnet-4.5',
} as const;

export function resolveOpenRouterApiKey(overrideKey?: string): string | null {
  if (overrideKey && overrideKey.trim()) return overrideKey.trim();
  if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim()) {
    return process.env.OPENROUTER_API_KEY.trim();
  }
  return null;
}

export interface OpenRouterAdvisorClient {
  generateGstAdvisory(
    userContextPrompt: string,
    choice?: OpenRouterModelChoice
  ): Promise<AiComplianceReview>;
}

export function createOpenRouterAdvisorClient(customKey?: string): OpenRouterAdvisorClient {
  const apiKey = resolveOpenRouterApiKey(customKey);

  return {
    async generateGstAdvisory(
      userContextPrompt: string,
      choice?: OpenRouterModelChoice
    ): Promise<AiComplianceReview> {
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not configured in environment or settings.');
      }

      const model = choice?.modelId || RECOMMENDED_MODELS.BALANCED;
      const startTime = Date.now();

      const systemPrompt = `You are the GSTPIXEL Indian GST Statutory Compliance Engine.
Analyze the provided invoice, tax calculation, or filing details strictly under the Central Goods and Services Tax (CGST) Act, State GST Acts, and Integrated GST (IGST) Act, 2017.
Statutory Rules:
1. Provide a concise, factual compliance review with evidence from the inputs.
2. Flag statutory risks (threshold breaches, reverse charge liability, e-invoicing mandates, HSN mismatches, intra vs inter-state tax head errors).
3. Do not invent tax rates, legal conclusions, or government approvals.
4. Output strictly valid JSON with keys:
{
  "summary": string,
  "statutoryRisks": string[],
  "suggestedActions": string[]
}`;

      const res = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://www.gstpixel.com',
          'X-Title': 'GSTPIXEL Compliance Engine',
        },
        body: JSON.stringify({
          model,
          temperature: choice?.temperature ?? 0.1,
          max_tokens: choice?.maxTokens ?? 800,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContextPrompt },
          ],
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenRouter API failed HTTP ${res.status}: ${errorText.slice(0, 200)}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const rawContent = data.choices?.[0]?.message?.content || '{}';
      try {
        const parsed = JSON.parse(rawContent) as {
          summary?: string;
          statutoryRisks?: string[];
          suggestedActions?: string[];
        };
        return {
          summary: parsed.summary || 'Summary unavailable.',
          statutoryRisks: parsed.statutoryRisks || [],
          suggestedActions: parsed.suggestedActions || [],
          modelUsed: model,
          latencyMs,
        };
      } catch {
        return {
          summary: rawContent,
          statutoryRisks: [],
          suggestedActions: [],
          modelUsed: model,
          latencyMs,
        };
      }
    },
  };
}
