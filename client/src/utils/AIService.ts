import { ScrapedItem } from '@/state/ScrapeStore';

export interface AIAnalysisResult {
  ai_analysis: string;
  sentiment_score: number;
  key_topics: string[];
  competitive_insights: string;
  risk_factors: string[];
}

export interface AIAnalysisRequest {
  content: string;
  company: string;
  category: string;
  title?: string;
  focus_areas?: string[];
  analysis_tone?: 'neutral' | 'confident' | 'skeptical' | 'enthusiastic';
  output_format?: 'bullets' | 'narrative' | 'table';
}

class AIService {
  private apiKey: string = '';
  private baseUrl: string = 'https://api.openai.com/v1';

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('openai_api_key', key);
  }

  getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('openai_api_key') || '';
    }
    return this.apiKey;
  }

  async analyzeContent(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }

    const prompt = this.buildAnalysisPrompt(request);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert competitive intelligence analyst. Analyze the provided content and return insights in the specified JSON format. Focus on extracting actionable competitive intelligence, identifying risks and opportunities, and providing strategic insights.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      // Parse the JSON response
      try {
        const parsed = JSON.parse(content);
        return {
          ai_analysis: parsed.ai_analysis || '',
          sentiment_score: parsed.sentiment_score || 0,
          key_topics: parsed.key_topics || [],
          competitive_insights: parsed.competitive_insights || '',
          risk_factors: parsed.risk_factors || []
        };
      } catch (parseError) {
        // Fallback to parsing the content manually if JSON parsing fails
        return this.parseFallbackResponse(content, request);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw error;
    }
  }

  private buildAnalysisPrompt(request: AIAnalysisRequest): string {
    const { content, company, category, title, focus_areas, analysis_tone, output_format } = request;
    
    return `Analyze the following content from ${company} (${category}) and provide insights in the exact JSON format specified below.

Content Title: ${title || 'N/A'}
Content Category: ${category}
Focus Areas: ${focus_areas?.join(', ') || 'competitive positioning, differentiation, pricing, risks, opportunities'}
Analysis Tone: ${analysis_tone || 'neutral'}
Output Format: ${output_format || 'bullets'}

Content:
${content.substring(0, 4000)}${content.length > 4000 ? '...' : ''}

Please analyze this content and return your response in the following JSON format:

{
  "ai_analysis": "A comprehensive analysis of the content including key insights, competitive positioning, and strategic implications",
  "sentiment_score": -1.0 to 1.0 (negative = negative sentiment, positive = positive sentiment, 0 = neutral),
  "key_topics": ["topic1", "topic2", "topic3"],
  "competitive_insights": "Specific insights about competitive advantages, market positioning, or strategic moves",
  "risk_factors": ["risk1", "risk2", "risk3"]
}

Focus on extracting actionable intelligence that would be valuable for competitive analysis and strategic decision-making.`;
  }

  private parseFallbackResponse(content: string, request: AIAnalysisRequest): AIAnalysisResult {
    // Fallback parsing if JSON parsing fails
    const analysis = content.includes('ai_analysis') ? content : content;
    
    // Extract key topics (look for bullet points or numbered lists)
    const topicMatches = content.match(/(?:^|\n)[•\-\*]\s*(.+?)(?=\n|$)/gm);
    const key_topics = topicMatches ? topicMatches.map(t => t.replace(/^[•\-\*]\s*/, '').trim()) : [];
    
    // Simple sentiment analysis based on keywords
    const positiveWords = ['positive', 'growth', 'success', 'advantage', 'opportunity', 'innovation'];
    const negativeWords = ['risk', 'challenge', 'limitation', 'concern', 'threat', 'difficulty'];
    
    let sentiment_score = 0;
    const contentLower = content.toLowerCase();
    positiveWords.forEach(word => {
      if (contentLower.includes(word)) sentiment_score += 0.2;
    });
    negativeWords.forEach(word => {
      if (contentLower.includes(word)) sentiment_score -= 0.2;
    });
    sentiment_score = Math.max(-1, Math.min(1, sentiment_score));
    
    return {
      ai_analysis: analysis,
      sentiment_score,
      key_topics: key_topics.slice(0, 5),
      competitive_insights: content.includes('competitive') ? content.substring(0, 200) + '...' : 'No specific competitive insights identified',
      risk_factors: content.includes('risk') ? ['Risk analysis available in full content'] : []
    };
  }

  async analyzeBatch(items: ScrapedItem[], focusAreas?: string[]): Promise<Map<string, AIAnalysisResult>> {
    const results = new Map<string, AIAnalysisResult>();
    
    for (const item of items) {
      try {
        if (item.markdown && item.markdown.length > 50) {
          const analysis = await this.analyzeContent({
            content: item.markdown,
            company: item.company,
            category: item.category,
            title: item.title,
            focus_areas: focusAreas
          });
          
          results.set(item.id, analysis);
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Failed to analyze item ${item.id}:`, error);
        // Continue with other items
      }
    }
    
    return results;
  }

  async generateCompetitiveSummary(companies: string[], focusAreas?: string[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }

    const prompt = `Generate a competitive intelligence summary for the following companies: ${companies.join(', ')}.
    
Focus Areas: ${focusAreas?.join(', ') || 'market positioning, competitive advantages, strategic moves, risks and opportunities'}

Please provide a comprehensive analysis that includes:
1. Market positioning comparison
2. Key competitive differentiators
3. Strategic insights and recommendations
4. Risk assessment
5. Opportunities for competitive advantage

Format the response in clear, actionable bullet points.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert competitive intelligence analyst specializing in market analysis and strategic insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Failed to generate competitive summary';
    } catch (error) {
      console.error('Competitive summary generation failed:', error);
      throw error;
    }
  }
}

export const aiService = new AIService(); 