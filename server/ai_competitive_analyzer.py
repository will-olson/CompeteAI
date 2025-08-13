# ai_competitive_analyzer.py
import os
import json
import requests
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
import logging
from dotenv import load_dotenv
import time
import re
from urllib.parse import urlparse
import hashlib

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('ai_competitive_analyzer.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AICompetitiveAnalyzer:
    """
    AI-powered competitive analysis engine using OpenAI and Anthropic APIs
    """
    
    def __init__(self, openai_api_key: Optional[str] = None, anthropic_api_key: Optional[str] = None):
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        self.anthropic_api_key = anthropic_api_key or os.getenv('ANTHROPIC_API_KEY')
        self.preferred_provider = 'openai' if self.openai_api_key else 'anthropic' if self.anthropic_api_key else None
        
        if not self.preferred_provider:
            logger.warning("No AI API keys configured. AI analysis will be limited.")
        
        # Initialize analysis templates
        self.analysis_templates = self._initialize_analysis_templates()
        
    def analyze_technical_content(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze technical content with industry and content-type context.
        Expected request fields: content, company, category, contentType, industry, technicalDepth
        """
        try:
            content = request.get('content', '')
            company = request.get('company', 'Unknown')
            category = request.get('category', 'unknown')
            content_type = request.get('contentType', 'api_docs')
            industry = request.get('industry', 'tech-saas')
            technical_depth = request.get('technicalDepth', 'intermediate')
            title = request.get('title', '')
            focus_areas = request.get('focus_areas', [])

            system_context = (
                f"You are an expert technical competitive intelligence analyst specializing in {industry}. "
                f"Provide {technical_depth} depth analysis for {content_type}."
            )

            user_prompt = (
                f"Analyze this {content_type} content from {company} (industry: {industry}).\n\n"
                f"Title: {title}\n"
                f"Category: {category}\n"
                f"Focus Areas: {', '.join(focus_areas) if focus_areas else 'api, features, pricing, integrations, security'}\n\n"
                f"Content:\n{content[:4000]}{'...' if len(content) > 4000 else ''}\n\n"
                "Return a strict JSON object with keys: ai_analysis, sentiment_score (-1..1), key_topics (array), "
                "competitive_insights (string), risk_factors (array), technical_recommendations (string)."
            )

            if not self.preferred_provider:
                # Mock structured response when no AI keys configured
                return {
                    'ai_analysis': f"Mock technical analysis for {company} ({content_type}).",
                    'sentiment_score': 0.0,
                    'key_topics': ['api', 'authentication', 'pricing'],
                    'competitive_insights': 'Mock insights: clear documentation; standard auth; usage-based pricing.',
                    'risk_factors': ['Mock risk: rate limits may impact throughput'],
                    'technical_recommendations': 'Mock recommendation: provide SDK examples and error handling guides.'
                }

            # Call underlying provider
            prompt = f"System: {system_context}\n\nUser: {user_prompt}"
            ai_response_text = self._get_ai_analysis(prompt, 'technical_content')

            # Try to parse JSON if the model returned JSON
            try:
                parsed = json.loads(ai_response_text)
                return {
                    'ai_analysis': parsed.get('ai_analysis', ''),
                    'sentiment_score': parsed.get('sentiment_score', 0),
                    'key_topics': parsed.get('key_topics', []),
                    'competitive_insights': parsed.get('competitive_insights', ''),
                    'risk_factors': parsed.get('risk_factors', []),
                    'technical_recommendations': parsed.get('technical_recommendations', '')
                }
            except Exception:
                # Fallback: build a minimal structured response from free-form text
                return {
                    'ai_analysis': ai_response_text,
                    'sentiment_score': 0,
                    'key_topics': [],
                    'competitive_insights': ai_response_text[:500],
                    'risk_factors': [],
                    'technical_recommendations': 'Review full analysis text for detailed recommendations.'
                }
        except Exception as e:
            logger.error(f"Error in analyze_technical_content: {str(e)}")
            return {
                'error': str(e)
            }
    
    def _initialize_analysis_templates(self) -> Dict[str, str]:
        """Initialize analysis prompt templates"""
        return {
            'competitive_analysis': """
            Analyze the following competitive data and provide insights on:
            1. Market positioning and competitive advantages
            2. Content strategy and messaging approaches
            3. Innovation focus and technology trends
            4. Potential threats and opportunities
            5. Strategic recommendations
            
            Data: {data}
            
            Provide a comprehensive analysis with specific insights and actionable recommendations.
            """,
            
            'battlecard_generation': """
            Create a competitive battlecard for {company_name} against {competitors} based on:
            1. Strengths and weaknesses analysis
            2. Feature comparison and differentiation
            3. Market positioning insights
            4. Strategic recommendations
            5. Competitive talking points
            
            Data: {data}
            
            Format the response as a structured battlecard with clear sections and actionable insights.
            """,
            
            'trend_analysis': """
            Analyze the following data for emerging trends and patterns:
            1. Content themes and messaging evolution
            2. Technology and feature adoption patterns
            3. Market dynamics and competitive moves
            4. Customer engagement and satisfaction trends
            5. Future outlook and predictions
            
            Data: {data}
            
            Identify key trends, their implications, and strategic recommendations.
            """,
            
            'risk_assessment': """
            Assess competitive risks and opportunities based on:
            1. Market positioning changes
            2. Technology disruptions
            3. Competitive moves and responses
            4. Customer sentiment shifts
            5. Industry dynamics
            
            Data: {data}
            
            Provide risk assessment with mitigation strategies and opportunity identification.
            """
        }
    
    def analyze_competitive_data(self, data: Dict[str, Any], analysis_type: str = 'comprehensive') -> Dict[str, Any]:
        """Perform AI-powered competitive analysis"""
        try:
            if not self.preferred_provider:
                return self._generate_mock_analysis(data, analysis_type)
            
            # Prepare data for analysis
            prepared_data = self._prepare_data_for_analysis(data)
            
            # Generate analysis prompt
            if analysis_type == 'comprehensive':
                prompt = self.analysis_templates['competitive_analysis'].format(data=prepared_data)
            elif analysis_type == 'trends':
                prompt = self.analysis_templates['trend_analysis'].format(data=prepared_data)
            elif analysis_type == 'risks':
                prompt = self.analysis_templates['risk_assessment'].format(data=prepared_data)
            else:
                prompt = self.analysis_templates['competitive_analysis'].format(data=prepared_data)
            
            # Get AI analysis
            ai_response = self._get_ai_analysis(prompt, analysis_type)
            
            # Structure the response
            analysis_result = {
                'analysis_type': analysis_type,
                'generated_at': datetime.now().isoformat(),
                'ai_provider': self.preferred_provider,
                'data_summary': self._generate_data_summary(data),
                'ai_insights': ai_response,
                'key_findings': self._extract_key_findings(ai_response),
                'strategic_recommendations': self._extract_recommendations(ai_response),
                'confidence_score': self._calculate_confidence_score(data, ai_response)
            }
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error in competitive analysis: {str(e)}")
            return {
                'error': str(e),
                'analysis_type': analysis_type,
                'generated_at': datetime.now().isoformat(),
                'status': 'failed'
            }
    
    def generate_competitive_battlecard(self, company_name: str, competitors: List[str], 
                                      data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered competitive battlecard"""
        try:
            if not self.preferred_provider:
                return self._generate_mock_battlecard(company_name, competitors, data)
            
            # Prepare data for battlecard generation
            prepared_data = self._prepare_data_for_analysis(data)
            
            # Generate battlecard prompt
            prompt = self.analysis_templates['battlecard_generation'].format(
                company_name=company_name,
                competitors=', '.join(competitors),
                data=prepared_data
            )
            
            # Get AI battlecard
            ai_response = self._get_ai_analysis(prompt, 'battlecard')
            
            # Structure the battlecard
            battlecard = {
                'company_name': company_name,
                'competitors': competitors,
                'generated_at': datetime.now().isoformat(),
                'ai_provider': self.preferred_provider,
                'executive_summary': self._extract_executive_summary(ai_response),
                'competitive_analysis': {
                    'strengths': self._extract_strengths(ai_response),
                    'weaknesses': self._extract_weaknesses(ai_response),
                    'opportunities': self._extract_opportunities(ai_response),
                    'threats': self._extract_threats(ai_response)
                },
                'feature_comparison': self._extract_feature_comparison(ai_response),
                'market_positioning': self._extract_market_positioning(ai_response),
                'strategic_recommendations': self._extract_recommendations(ai_response),
                'competitive_talking_points': self._extract_talking_points(ai_response),
                'risk_assessment': self._extract_risk_assessment(ai_response),
                'ai_insights': ai_response
            }
            
            return battlecard
            
        except Exception as e:
            logger.error(f"Error generating battlecard: {str(e)}")
            return {
                'error': str(e),
                'company_name': company_name,
                'competitors': competitors,
                'generated_at': datetime.now().isoformat(),
                'status': 'failed'
            }
    
    def analyze_content_strategy(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze content strategy and messaging approaches"""
        try:
            # Extract content-related data
            content_data = self._extract_content_metrics(data)
            
            # Generate content analysis prompt
            prompt = f"""
            Analyze the following content strategy data and provide insights on:
            1. Content themes and messaging consistency
            2. Content quality and engagement factors
            3. Content distribution and channel effectiveness
            4. Competitive content positioning
            5. Content strategy recommendations
            
            Content Data: {json.dumps(content_data, indent=2)}
            
            Provide specific insights on content strategy effectiveness and recommendations for improvement.
            """
            
            # Get AI analysis
            ai_response = self._get_ai_analysis(prompt, 'content_strategy')
            
            # Structure the response
            content_analysis = {
                'analysis_type': 'content_strategy',
                'generated_at': datetime.now().isoformat(),
                'ai_provider': self.preferred_provider,
                'content_metrics': content_data,
                'ai_insights': ai_response,
                'content_themes': self._extract_content_themes(ai_response),
                'messaging_analysis': self._extract_messaging_analysis(ai_response),
                'engagement_factors': self._extract_engagement_factors(ai_response),
                'strategy_recommendations': self._extract_recommendations(ai_response)
            }
            
            return content_analysis
            
        except Exception as e:
            logger.error(f"Error in content strategy analysis: {str(e)}")
            return {
                'error': str(e),
                'analysis_type': 'content_strategy',
                'generated_at': datetime.now().isoformat(),
                'status': 'failed'
            }
    
    def detect_competitive_moves(self, data: Dict[str, Any], time_window_days: int = 30) -> Dict[str, Any]:
        """Detect and analyze competitive moves and changes"""
        try:
            # Filter data for recent changes
            recent_data = self._filter_recent_data(data, time_window_days)
            
            # Generate competitive moves analysis prompt
            prompt = f"""
            Analyze the following recent competitive data and identify:
            1. New product launches or feature announcements
            2. Pricing changes or business model shifts
            3. Partnership or acquisition activities
            4. Market positioning changes
            5. Strategic competitive moves and their implications
            
            Recent Data: {json.dumps(recent_data, indent=2)}
            
            Identify specific competitive moves, their strategic significance, and recommended responses.
            """
            
            # Get AI analysis
            ai_response = self._get_ai_analysis(prompt, 'competitive_moves')
            
            # Structure the response
            competitive_moves = {
                'analysis_type': 'competitive_moves',
                'generated_at': datetime.now().isoformat(),
                'ai_provider': self.preferred_provider,
                'time_window_days': time_window_days,
                'recent_data_summary': self._generate_data_summary(recent_data),
                'ai_insights': ai_response,
                'detected_moves': self._extract_competitive_moves(ai_response),
                'strategic_implications': self._extract_strategic_implications(ai_response),
                'recommended_responses': self._extract_recommendations(ai_response),
                'priority_levels': self._assign_priority_levels(ai_response)
            }
            
            return competitive_moves
            
        except Exception as e:
            logger.error(f"Error detecting competitive moves: {str(e)}")
            return {
                'error': str(e),
                'analysis_type': 'competitive_moves',
                'generated_at': datetime.now().isoformat(),
                'status': 'failed'
            }
    
    def _get_ai_analysis(self, prompt: str, analysis_type: str) -> str:
        """Get AI analysis from configured provider"""
        try:
            if self.preferred_provider == 'openai':
                return self._call_openai_api(prompt, analysis_type)
            elif self.preferred_provider == 'anthropic':
                return self._call_anthropic_api(prompt, analysis_type)
            else:
                return "AI analysis not available - no API keys configured"
                
        except Exception as e:
            logger.error(f"Error calling AI API: {str(e)}")
            return f"AI analysis failed: {str(e)}"
    
    def _call_openai_api(self, prompt: str, analysis_type: str) -> str:
        """Call OpenAI API for analysis"""
        try:
            headers = {
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': 'gpt-4',
                'messages': [
                    {
                        'role': 'system',
                        'content': f'You are an expert competitive intelligence analyst specializing in {analysis_type}. Provide clear, actionable insights.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'max_tokens': 2000,
                'temperature': 0.7
            }
            
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            return result['choices'][0]['message']['content']
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
    
    def _call_anthropic_api(self, prompt: str, analysis_type: str) -> str:
        """Call Anthropic API for analysis"""
        try:
            headers = {
                'x-api-key': self.anthropic_api_key,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
            
            data = {
                'model': 'claude-3-sonnet-20240229',
                'max_tokens': 2000,
                'messages': [
                    {
                        'role': 'user',
                        'content': f'You are an expert competitive intelligence analyst specializing in {analysis_type}. Provide clear, actionable insights.\n\n{prompt}'
                    }
                ]
            }
            
            response = requests.post(
                'https://api.anthropic.com/v1/messages',
                headers=headers,
                json=data,
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            return result['content'][0]['text']
            
        except Exception as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise
    
    def _prepare_data_for_analysis(self, data: Dict[str, Any]) -> str:
        """Prepare data for AI analysis"""
        try:
            # Extract key metrics and insights
            summary = {
                'total_companies': data.get('summary', {}).get('total_companies', 0),
                'total_items': data.get('summary', {}).get('total_items', 0),
                'total_words': data.get('summary', {}).get('total_words', 0),
                'companies_analyzed': list(data.get('companies', {}).keys()),
                'content_quality_metrics': self._extract_content_quality_metrics(data),
                'competitive_insights': self._extract_competitive_insights(data)
            }
            
            return json.dumps(summary, indent=2)
            
        except Exception as e:
            logger.error(f"Error preparing data for analysis: {str(e)}")
            return str(data)
    
    def _extract_content_metrics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract content-related metrics and data for analysis"""
        content_metrics = {
            'content_summary': {},
            'company_content': {},
            'category_breakdown': {},
            'content_quality': {}
        }
        
        try:
            # Extract overall content summary
            content_metrics['content_summary'] = {
                'total_companies': data.get('summary', {}).get('total_companies', 0),
                'total_items': data.get('summary', {}).get('total_items', 0),
                'total_words': data.get('summary', {}).get('total_words', 0),
                'total_links': data.get('summary', {}).get('total_links', 0),
                'total_images': data.get('summary', {}).get('total_images', 0),
                'rich_content_count': data.get('summary', {}).get('rich_content_count', 0)
            }
            
            # Extract company-specific content data
            companies = data.get('companies', {})
            for company, company_data in companies.items():
                if isinstance(company_data, dict) and 'error' not in company_data:
                    content_metrics['company_content'][company] = {
                        'total_items': company_data.get('summary', {}).get('total_items', 0),
                        'total_words': company_data.get('summary', {}).get('total_words', 0),
                        'categories': list(company_data.get('categories', {}).keys())
                    }
                    
                    # Extract category breakdown
                    for category, category_data in company_data.get('categories', {}).items():
                        if isinstance(category_data, dict) and 'error' not in category_data:
                            if category not in content_metrics['category_breakdown']:
                                content_metrics['category_breakdown'][category] = {
                                    'total_items': 0,
                                    'total_words': 0,
                                    'companies': set()
                                }
                            
                            content_metrics['category_breakdown'][category]['total_items'] += len(category_data.get('items', []))
                            content_metrics['category_breakdown'][category]['total_words'] += category_data.get('total_words', 0)
                            content_metrics['category_breakdown'][category]['companies'].add(company)
            
            # Convert sets to lists for JSON serialization
            for category in content_metrics['category_breakdown']:
                content_metrics['category_breakdown'][category]['companies'] = list(content_metrics['category_breakdown'][category]['companies'])
            
            # Extract content quality metrics
            content_metrics['content_quality'] = self._extract_content_quality_metrics(data)
            
        except Exception as e:
            logger.error(f"Error extracting content metrics: {str(e)}")
        
        return content_metrics

    def _extract_content_quality_metrics(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract content quality metrics from data"""
        metrics = {
            'average_words_per_item': 0,
            'rich_content_percentage': 0,
            'link_density': 0,
            'image_density': 0
        }
        
        try:
            total_items = data.get('summary', {}).get('total_items', 0)
            total_words = data.get('summary', {}).get('total_words', 0)
            total_links = data.get('summary', {}).get('total_links', 0)
            total_images = data.get('summary', {}).get('total_images', 0)
            rich_content = data.get('summary', {}).get('rich_content_count', 0)
            
            if total_items > 0:
                metrics['average_words_per_item'] = round(total_words / total_items, 2)
                metrics['rich_content_percentage'] = round((rich_content / total_items) * 100, 2)
                metrics['link_density'] = round(total_links / total_items, 2)
                metrics['image_density'] = round(total_images / total_items, 2)
                
        except Exception as e:
            logger.error(f"Error extracting content quality metrics: {str(e)}")
        
        return metrics
    
    def _extract_competitive_insights(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract competitive insights from data"""
        insights = {
            'company_performance': {},
            'content_strategies': {},
            'market_positioning': {}
        }
        
        try:
            companies = data.get('companies', {})
            
            for company, company_data in companies.items():
                if isinstance(company_data, dict) and 'error' not in company_data:
                    # Company performance metrics
                    insights['company_performance'][company] = {
                        'total_items': company_data.get('summary', {}).get('total_items', 0),
                        'total_words': company_data.get('summary', {}).get('total_words', 0),
                        'rich_content_count': company_data.get('summary', {}).get('rich_content_count', 0)
                    }
                    
                    # Content strategy analysis
                    content_strategy = {}
                    for category, category_data in company_data.get('categories', {}).items():
                        if isinstance(category_data, dict) and 'error' not in category_data:
                            content_strategy[category] = {
                                'items_count': len(category_data.get('items', [])),
                                'total_words': category_data.get('total_words', 0),
                                'rich_content_count': category_data.get('rich_content_count', 0)
                            }
                    
                    insights['content_strategies'][company] = content_strategy
                    
        except Exception as e:
            logger.error(f"Error extracting competitive insights: {str(e)}")
        
        return insights
    
    def _generate_data_summary(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate summary of analyzed data"""
        summary = {
            'total_companies': data.get('summary', {}).get('total_companies', 0),
            'total_items': data.get('summary', {}).get('total_items', 0),
            'total_words': data.get('summary', {}).get('total_words', 0),
            'total_links': data.get('summary', {}).get('total_links', 0),
            'total_images': data.get('summary', {}).get('total_images', 0),
            'rich_content_count': data.get('summary', {}).get('rich_content_count', 0),
            'companies_analyzed': list(data.get('companies', {}).keys())
        }
        
        return summary
    
    def _filter_recent_data(self, data: Dict[str, Any], days: int) -> Dict[str, Any]:
        """Filter data for recent changes within specified time window"""
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_data = {}
        
        try:
            companies = data.get('companies', {})
            
            for company, company_data in companies.items():
                if isinstance(company_data, dict) and 'error' not in company_data:
                    recent_categories = {}
                    
                    for category, category_data in company_data.get('categories', {}).items():
                        if isinstance(category_data, dict) and 'error' not in category_data:
                            # Filter items by date if available
                            recent_items = []
                            for item in category_data.get('items', []):
                                item_date = item.get('scraped_at') or item.get('published') or item.get('imported_at')
                                if item_date:
                                    try:
                                        item_datetime = datetime.fromisoformat(item_date.replace('Z', '+00:00'))
                                        if item_datetime > cutoff_date:
                                            recent_items.append(item)
                                    except:
                                        recent_items.append(item)
                                else:
                                    recent_items.append(item)
                            
                            if recent_items:
                                recent_categories[category] = {
                                    **category_data,
                                    'items': recent_items
                                }
                    
                    if recent_categories:
                        recent_data[company] = {
                            **company_data,
                            'categories': recent_categories
                        }
                        
        except Exception as e:
            logger.error(f"Error filtering recent data: {str(e)}")
        
        return recent_data
    
    # Content analysis extraction methods
    def _extract_content_themes(self, ai_response: str) -> List[str]:
        """Extract content themes from AI response"""
        themes = []
        # Simple extraction logic - in production, use more sophisticated NLP
        if 'content themes' in ai_response.lower():
            # Extract themes from response
            pass
        return themes
    
    def _extract_messaging_analysis(self, ai_response: str) -> Dict[str, Any]:
        """Extract messaging analysis from AI response"""
        return {'analysis': ai_response, 'key_points': []}
    
    def _extract_engagement_factors(self, ai_response: str) -> List[str]:
        """Extract engagement factors from AI response"""
        return []
    
    # Battlecard extraction methods
    def _extract_executive_summary(self, ai_response: str) -> str:
        """Extract executive summary from AI response"""
        return ai_response[:500] + "..." if len(ai_response) > 500 else ai_response
    
    def _extract_strengths(self, ai_response: str) -> List[str]:
        """Extract strengths from AI response"""
        return []
    
    def _extract_weaknesses(self, ai_response: str) -> List[str]:
        """Extract weaknesses from AI response"""
        return []
    
    def _extract_opportunities(self, ai_response: str) -> List[str]:
        """Extract opportunities from AI response"""
        return []
    
    def _extract_threats(self, ai_response: str) -> List[str]:
        """Extract threats from AI response"""
        return []
    
    def _extract_feature_comparison(self, ai_response: str) -> Dict[str, Any]:
        """Extract feature comparison from AI response"""
        return {}
    
    def _extract_market_positioning(self, ai_response: str) -> Dict[str, Any]:
        """Extract market positioning from AI response"""
        return {}
    
    def _extract_talking_points(self, ai_response: str) -> List[str]:
        """Extract competitive talking points from AI response"""
        return []
    
    def _extract_risk_assessment(self, ai_response: str) -> Dict[str, Any]:
        """Extract risk assessment from AI response"""
        return {}
    
    # General extraction methods
    def _extract_key_findings(self, ai_response: str) -> List[str]:
        """Extract key findings from AI response"""
        return []
    
    def _extract_recommendations(self, ai_response: str) -> List[str]:
        """Extract strategic recommendations from AI response"""
        return []
    
    def _extract_competitive_moves(self, ai_response: str) -> List[str]:
        """Extract competitive moves from AI response"""
        return []
    
    def _extract_strategic_implications(self, ai_response: str) -> List[str]:
        """Extract strategic implications from AI response"""
        return []
    
    def _assign_priority_levels(self, ai_response: str) -> Dict[str, str]:
        """Assign priority levels to findings"""
        return {}
    
    def _calculate_confidence_score(self, data: Dict[str, Any], ai_response: str) -> float:
        """Calculate confidence score for AI analysis"""
        # Simple confidence calculation based on data quality and response length
        data_quality = min(100, data.get('summary', {}).get('total_items', 0) * 2)
        response_quality = min(100, len(ai_response) / 10)
        
        return round((data_quality + response_quality) / 2, 2)
    
    # Mock analysis methods for when AI is not available
    def _generate_mock_analysis(self, data: Dict[str, Any], analysis_type: str) -> Dict[str, Any]:
        """Generate mock analysis when AI is not available"""
        return {
            'analysis_type': analysis_type,
            'generated_at': datetime.now().isoformat(),
            'ai_provider': 'mock',
            'data_summary': self._generate_data_summary(data),
            'ai_insights': f"Mock {analysis_type} analysis - AI API not configured",
            'key_findings': ['Mock finding 1', 'Mock finding 2'],
            'strategic_recommendations': ['Mock recommendation 1', 'Mock recommendation 2'],
            'confidence_score': 50.0
        }
    
    def _generate_mock_battlecard(self, company_name: str, competitors: List[str], 
                                 data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock battlecard when AI is not available"""
        return {
            'company_name': company_name,
            'competitors': competitors,
            'generated_at': datetime.now().isoformat(),
            'ai_provider': 'mock',
            'executive_summary': f"Mock battlecard for {company_name} against {', '.join(competitors)}",
            'competitive_analysis': {
                'strengths': ['Mock strength 1', 'Mock strength 2'],
                'weaknesses': ['Mock weakness 1', 'Mock weakness 2'],
                'opportunities': ['Mock opportunity 1', 'Mock opportunity 2'],
                'threats': ['Mock threat 1', 'Mock threat 2']
            },
            'feature_comparison': {},
            'market_positioning': {},
            'strategic_recommendations': ['Mock recommendation 1', 'Mock recommendation 2'],
            'competitive_talking_points': ['Mock talking point 1', 'Mock talking point 2'],
            'risk_assessment': {},
            'ai_insights': 'Mock battlecard - AI API not configured'
        }


# Example usage and testing
if __name__ == "__main__":
    # Initialize analyzer
    analyzer = AICompetitiveAnalyzer()
    
    # Mock data for testing
    mock_data = {
        'summary': {
            'total_companies': 3,
            'total_items': 15,
            'total_words': 5000,
            'total_links': 45,
            'total_images': 12,
            'rich_content_count': 8
        },
        'companies': {
            'CompanyA': {
                'summary': {'total_items': 5, 'total_words': 2000, 'rich_content_count': 3},
                'categories': {'marketing': {'items': [], 'total_words': 1000}}
            },
            'CompanyB': {
                'summary': {'total_items': 5, 'total_words': 1500, 'rich_content_count': 2},
                'categories': {'docs': {'items': [], 'total_words': 800}}
            },
            'CompanyC': {
                'summary': {'total_items': 5, 'total_words': 1500, 'rich_content_count': 3},
                'categories': {'rss': {'items': [], 'total_words': 700}}
            }
        }
    }
    
    # Test competitive analysis
    analysis = analyzer.analyze_competitive_data(mock_data, 'comprehensive')
    print(f"Analysis completed: {analysis.get('analysis_type', 'unknown')}")
    
    # Test battlecard generation
    battlecard = analyzer.generate_competitive_battlecard("CompanyA", ["CompanyB", "CompanyC"], mock_data)
    print(f"Battlecard generated for: {battlecard.get('company_name', 'unknown')}") 