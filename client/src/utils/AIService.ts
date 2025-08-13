import { ScrapedItem } from '@/state/ScrapeStore';

export interface AIAnalysisResult {
  ai_analysis: string;
  sentiment_score: number;
  key_topics: string[];
  competitive_insights: string;
  risk_factors: string[];
  technical_recommendations?: string; // 12-hour MVP enhancement
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

// 12-hour MVP enhancement: Technical analysis interface
export interface TechnicalAnalysisRequest extends AIAnalysisRequest {
  contentType: 'api_docs' | 'pricing' | 'features' | 'integrations';
  industry: string;
  technicalDepth: 'basic' | 'intermediate' | 'advanced';
}

// 12-hour MVP enhancement: Industry-specific analysis capabilities
const INDUSTRY_PROMPTS = {
  'tech-saas': {
    focus: ['api_integration', 'scalability', 'enterprise_features', 'security'],
    technical_keywords: ['api', 'sdk', 'webhook', 'oauth', 'rate_limiting'],
    system_prompt: 'You are an expert technical competitive intelligence analyst specializing in SaaS and technology companies. Focus on API capabilities, scalability features, enterprise functionality, and security measures.'
  },
  'fintech': {
    focus: ['compliance', 'security', 'api_reliability', 'pricing_models'],
    technical_keywords: ['pci', 'soc2', 'api_versioning', 'webhook_security'],
    system_prompt: 'You are an expert technical competitive intelligence analyst specializing in financial technology. Focus on regulatory compliance, security standards, API reliability, and pricing model analysis.'
  },
  'ecommerce': {
    focus: ['checkout_process', 'payment_integration', 'inventory_management'],
    technical_keywords: ['payment_gateway', 'inventory_api', 'order_management'],
    system_prompt: 'You are an expert technical competitive intelligence analyst specializing in e-commerce platforms. Focus on checkout processes, payment integrations, inventory management, and order processing capabilities.'
  },
  'ai-ml': {
    focus: ['model_performance', 'api_latency', 'training_data', 'ethical_ai'],
    technical_keywords: ['inference', 'training', 'model_serving', 'api_keys'],
    system_prompt: 'You are an expert technical competitive intelligence analyst specializing in artificial intelligence and machine learning. Focus on model performance, API latency, training data quality, and ethical AI considerations.'
  }
};

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

  // 12-hour MVP enhancement: Technical content analysis
  async analyzeTechnicalContent(request: TechnicalAnalysisRequest): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }

    const technicalPrompt = this.buildTechnicalPrompt(request);
    const industryContext = INDUSTRY_PROMPTS[request.industry as keyof typeof INDUSTRY_PROMPTS];
    
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
              content: industryContext?.system_prompt || 'You are an expert technical competitive intelligence analyst. Analyze technical documentation and provide actionable insights.'
            },
            {
              role: 'user',
              content: technicalPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 2500
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
          risk_factors: parsed.risk_factors || [],
          technical_recommendations: parsed.technical_recommendations || ''
        };
      } catch (parseError) {
        // Fallback to parsing the content manually if JSON parsing fails
        return this.parseTechnicalFallbackResponse(content, request);
      }
    } catch (error) {
      console.error('Technical analysis failed:', error);
      throw error;
    }
  }

  private buildTechnicalPrompt(request: TechnicalAnalysisRequest): string {
    const { content, company, category, contentType, industry, technicalDepth } = request;
    
    return `Analyze this ${contentType} content from ${company} (${industry}) with ${technicalDepth} technical depth.

Content Category: ${category}
Industry: ${industry}
Technical Focus: ${contentType}

Content:
${content.substring(0, 4000)}${content.length > 4000 ? '...' : ''}

Provide analysis in this exact JSON format:
{
  "ai_analysis": "Technical analysis with competitive insights",
  "sentiment_score": -1.0 to 1.0 (negative = negative sentiment, positive = positive sentiment, 0 = neutral),
  "key_topics": ["technical_feature1", "technical_feature2"],
  "competitive_insights": "Technical competitive advantages",
  "risk_factors": ["technical_risk1", "technical_risk2"],
  "technical_recommendations": "Actionable technical insights"
}

Focus on extracting actionable intelligence that would be valuable for competitive analysis and strategic decision-making.`;
  }

  private parseTechnicalFallbackResponse(content: string, request: TechnicalAnalysisRequest): AIAnalysisResult {
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
    
    // Extract technical recommendations
    const technicalRecommendations = content.includes('recommendation') || content.includes('suggest') 
      ? content.substring(0, 300) + '...' 
      : 'Technical analysis available in full content';
    
    return {
      ai_analysis: analysis,
      sentiment_score,
      key_topics: key_topics.slice(0, 5),
      competitive_insights: content.includes('competitive') ? content.substring(0, 200) + '...' : 'No specific competitive insights identified',
      risk_factors: content.includes('risk') ? ['Risk analysis available in full content'] : [],
      technical_recommendations: technicalRecommendations
    };
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

  // 12-hour MVP enhancement: Optimized batch processing
  async analyzeBatchOptimized(items: ScrapedItem[], focusAreas?: string[]): Promise<Map<string, AIAnalysisResult>> {
    const results = new Map<string, AIAnalysisResult>();
    const batchSize = 5; // Process 5 items simultaneously
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(async (item) => {
        try {
          if (item.markdown && item.markdown.length > 50) {
            const analysis = await this.analyzeContent({
              content: item.markdown,
              company: item.company,
              category: item.category,
              title: item.title,
              focus_areas: focusAreas
            });
            
            return { id: item.id, analysis };
          }
        } catch (error) {
          console.error(`Failed to analyze item ${item.id}:`, error);
          return { id: item.id, error: error.message };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(result => {
        if ('analysis' in result) {
          results.set(result.id, result.analysis);
        }
      });
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return results;
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

    const prompt = `Analyze the competitive landscape for the following companies: ${companies.join(', ')}.

Focus Areas: ${focusAreas?.join(', ') || 'competitive positioning, differentiation, pricing, risks, opportunities'}

Please provide a comprehensive competitive intelligence summary covering:

1. **Market Positioning**: How these companies position themselves relative to each other
2. **Key Differentiators**: What makes each company unique
3. **Competitive Advantages**: Strengths and weaknesses of each player
4. **Market Trends**: Emerging patterns and opportunities
5. **Risk Factors**: Potential threats and challenges
6. **Strategic Recommendations**: Actionable insights for competitive analysis

Format your response as a clear, structured analysis that would be valuable for strategic decision-making.`;

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
              content: `You are an expert competitive intelligence analyst. Provide clear, actionable insights about competitive landscapes and market positioning.`
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
      return data.choices[0]?.message?.content || 'Failed to generate competitive summary';
    } catch (error) {
      console.error('Failed to generate competitive summary:', error);
      throw error;
    }
  }

  // 12-hour MVP enhancement: Industry-specific analysis helper
  getIndustryContext(industry: string) {
    return INDUSTRY_PROMPTS[industry as keyof typeof INDUSTRY_PROMPTS] || null;
  }

  // 12-hour MVP enhancement: Technical content type detection
  detectContentType(content: string): 'api_docs' | 'pricing' | 'features' | 'integrations' | 'unknown' {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('api') || contentLower.includes('endpoint') || contentLower.includes('authentication')) {
      return 'api_docs';
    } else if (contentLower.includes('price') || contentLower.includes('plan') || contentLower.includes('billing')) {
      return 'pricing';
    } else if (contentLower.includes('feature') || contentLower.includes('capability') || contentLower.includes('functionality')) {
      return 'features';
    } else if (contentLower.includes('integration') || contentLower.includes('webhook') || contentLower.includes('sdk')) {
      return 'integrations';
    }
    
    return 'unknown';
  }
}

export const aiService = new AIService(); 