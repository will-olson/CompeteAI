export type LLMProvider = 'openai' | 'anthropic';

export interface AnalysisOptions {
  provider: LLMProvider;
  tone: 'neutral' | 'confident' | 'skeptical' | 'enthusiastic';
  length: 'short' | 'medium' | 'long';
  format: 'bullets' | 'narrative' | 'table';
  focusAreas?: string; // comma-separated topics
}

const KEYS = {
  provider: 'llm_provider',
  openai: 'openai_api_key',
  anthropic: 'anthropic_api_key',
};

export const LLMService = {
  saveProvider(provider: LLMProvider) {
    localStorage.setItem(KEYS.provider, provider);
  },
  getProvider(): LLMProvider | null {
    return (localStorage.getItem(KEYS.provider) as LLMProvider) || null;
  },
  saveKey(provider: LLMProvider, key: string) {
    localStorage.setItem(provider === 'openai' ? KEYS.openai : KEYS.anthropic, key);
  },
  getKey(provider: LLMProvider): string | null {
    return localStorage.getItem(provider === 'openai' ? KEYS.openai : KEYS.anthropic);
  },

  async analyze(corpus: string, options: AnalysisOptions): Promise<string> {
    const { provider, tone, length, format, focusAreas } = options;
    const apiKey = this.getKey(provider);
    if (!apiKey) throw new Error('Missing API key for provider');

    const system = `You are an analyst producing competitive intelligence distillations. Tone=${tone}. Length=${length}. Format=${format}. Focus Areas=${focusAreas || 'general competitive insights'}. Output should be clean and directly usable.`;
    const user = `Analyze the following scraped corpus. Extract key signals, strengths/weaknesses, positioning, differentiators, product focus, pricing hints, and risks.\n\nCORPUS:\n\n${corpus.slice(0, 50000)}`;

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.2,
        }),
      });
      if (!res.ok) throw new Error('OpenAI request failed');
      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'No output';
    }

    // Anthropic
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1200,
        temperature: 0.2,
        system,
        messages: [
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) throw new Error('Anthropic request failed');
    const data = await res.json();
    const content = data.content?.[0]?.text || data.output_text || 'No output';
    return content;
  }
};
