#!/usr/bin/env python3
"""
Dynamic Bulk Scraper for Competitive Intelligence

This module implements dynamic scraping across third-party websites to gather
competitive intelligence data for the 10 strategic dimensions.
"""

import requests
import time
import json
import logging
from typing import Dict, List, Optional, Any
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import re
from datetime import datetime, timedelta
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RateLimiter:
    """Rate limiter for respectful scraping"""
    
    def __init__(self, min_delay: float = 1.0, max_delay: float = 3.0):
        self.min_delay = min_delay
        self.max_delay = max_delay
        self.last_request_time = 0
    
    def wait(self):
        """Wait appropriate time between requests"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_delay:
            sleep_time = self.min_delay - time_since_last
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
        
        # Add random delay for additional respectfulness
        random_delay = random.uniform(0.5, 1.5)
        time.sleep(random_delay)

class UserAgentRotator:
    """Rotate user agents to avoid detection"""
    
    def __init__(self):
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
        ]
        self.current_index = 0
    
    def get_user_agent(self) -> str:
        """Get next user agent in rotation"""
        user_agent = self.user_agents[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.user_agents)
        return user_agent

class ContentAnalyzer:
    """Analyze content relevance and extract insights"""
    
    def __init__(self):
        # Dimension-specific keywords for relevance scoring
        self.dimension_keywords = {
            'spreadsheet_interface': [
                'spreadsheet', 'excel', 'interface', 'user experience', 'ui', 'ux',
                'table', 'grid', 'cell', 'formula', 'pivot', 'chart'
            ],
            'semantic_layer_integration': [
                'semantic', 'data model', 'business logic', 'definition', 'governance',
                'metadata', 'schema', 'ontology', 'business terms'
            ],
            'data_app_development': [
                'app', 'application', 'dashboard', 'custom', 'development',
                'embed', 'white label', 'api', 'integration'
            ],
            'multi_modal_development': [
                'multi-modal', 'development', 'workflow', 'template', 'code',
                'visual', 'programming', 'customization'
            ],
            'writeback': [
                'writeback', 'write back', 'modify', 'edit', 'update',
                'change', 'modification', 'editing'
            ],
            'ai_model_flexibility': [
                'ai', 'artificial intelligence', 'machine learning', 'ml',
                'predictive', 'natural language', 'nlp', 'insights'
            ],
            'unstructured_data_querying': [
                'unstructured', 'text', 'document', 'content', 'analysis',
                'mining', 'processing', 'nlp', 'ocr'
            ],
            'governed_collaboration': [
                'governance', 'collaboration', 'access control', 'security',
                'compliance', 'audit', 'permissions', 'roles'
            ],
            'materialization_controls': [
                'materialization', 'caching', 'pipeline', 'optimization',
                'performance', 'refresh', 'schedule', 'automation'
            ],
            'lineage': [
                'lineage', 'provenance', 'tracking', 'impact', 'dependency',
                'audit trail', 'data flow', 'source'
            ]
        }
    
    def analyze_content_relevance(self, content: str, dimension: str) -> Dict[str, Any]:
        """Analyze content relevance to specific dimension"""
        if dimension not in self.dimension_keywords:
            return {'relevance_score': 0.0, 'confidence': 0.0}
        
        keywords = self.dimension_keywords[dimension]
        content_lower = content.lower()
        
        # Count keyword matches
        keyword_matches = sum(1 for keyword in keywords if keyword in content_lower)
        
        # Calculate relevance score (0-1)
        max_keywords = len(keywords)
        relevance_score = min(keyword_matches / max_keywords, 1.0)
        
        # Calculate confidence based on content length and keyword density
        content_length = len(content)
        keyword_density = keyword_matches / content_length if content_length > 0 else 0
        
        confidence = min(relevance_score * 0.7 + keyword_density * 1000, 1.0)
        
        return {
            'relevance_score': relevance_score,
            'confidence': confidence,
            'keyword_matches': keyword_matches,
            'total_keywords': max_keywords,
            'keyword_density': keyword_density
        }
    
    def extract_sentiment(self, content: str) -> str:
        """Extract sentiment from content (basic implementation)"""
        positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'awesome']
        negative_words = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'poor']
        
        content_lower = content.lower()
        positive_count = sum(1 for word in positive_words if word in content_lower)
        negative_count = sum(1 for word in negative_words if word in content_lower)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
    
    def extract_rating(self, content: str) -> Optional[float]:
        """Extract numerical rating from content"""
        # Look for rating patterns like "4.5 stars", "8/10", etc.
        rating_patterns = [
            r'(\d+\.?\d*)\s*(?:stars?|out of 10|/10)',
            r'rating[:\s]*(\d+\.?\d*)',
            r'score[:\s]*(\d+\.?\d*)',
            r'(\d+\.?\d*)/10',
            r'(\d+\.?\d*)\s*stars?'
        ]
        
        for pattern in rating_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                try:
                    rating = float(match.group(1))
                    if 0 <= rating <= 10:
                        return rating
                except ValueError:
                    continue
        
        return None

class DynamicBulkScraper:
    """Main scraper for third-party sources"""
    
    def __init__(self):
        self.session = self._create_session()
        self.rate_limiter = RateLimiter()
        self.user_agent_rotator = UserAgentRotator()
        self.content_analyzer = ContentAnalyzer()
        
        # URL patterns for different sources
        self.url_patterns = {
            'g2': {
                'base_url': 'https://www.g2.com',
                'company_reviews': '/products/{company}/reviews',
                'company_alternatives': '/products/{company}/alternatives',
                'category_comparison': '/categories/{category}/compare/{company1}-vs-{company2}'
            },
            'reddit': {
                'base_url': 'https://www.reddit.com',
                'search': '/r/{subreddit}/search/?q={query}&restrict_sr=1',
                'top_posts': '/r/{subreddit}/top/?t=month'
            },
            'capterra': {
                'base_url': 'https://www.capterra.com',
                'company_reviews': '/p/{company}/',
                'company_alternatives': '/p/{company}/alternatives/'
            },
            'trustradius': {
                'base_url': 'https://www.trustradius.com',
                'company_reviews': '/products/{company}',
                'company_alternatives': '/products/{company}/alternatives'
            }
        }
        
        # Target subreddits for competitive intelligence
        self.target_subreddits = [
            'BusinessIntelligence', 'dataengineering', 'analytics', 'datascience',
            'snowflake', 'databricks', 'tableau', 'powerbi', 'qlik'
        ]
    
    def _create_session(self) -> requests.Session:
        """Create requests session with proper headers"""
        session = requests.Session()
        session.headers.update({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        return session
    
    def scrape_company_dimension(self, company_name: str, dimension: str) -> List[Dict[str, Any]]:
        """Scrape content for a specific company and dimension"""
        logger.info(f"Scraping {company_name} for dimension: {dimension}")
        
        results = []
        
        # Scrape from different sources
        try:
            # Reddit scraping
            reddit_results = self._scrape_reddit(company_name, dimension)
            results.extend(reddit_results)
            
            # G2 scraping
            g2_results = self._scrape_g2(company_name, dimension)
            results.extend(g2_results)
            
            # Capterra scraping
            capterra_results = self._scrape_capterra(company_name, dimension)
            results.extend(capterra_results)
            
            # TrustRadius scraping
            trustradius_results = self._scrape_trustradius(company_name, dimension)
            results.extend(trustradius_results)
            
        except Exception as e:
            logger.error(f"Error scraping {company_name} for {dimension}: {e}")
        
        # Analyze and score results
        scored_results = []
        for result in results:
            relevance = self.content_analyzer.analyze_content_relevance(
                result.get('content', ''), dimension
            )
            
            if relevance['relevance_score'] > 0.3:  # Only include relevant content
                scored_result = {
                    **result,
                    'relevance_score': relevance['relevance_score'],
                    'confidence_score': relevance['confidence'],
                    'sentiment': self.content_analyzer.extract_sentiment(result.get('content', '')),
                    'rating': self.content_analyzer.extract_rating(result.get('content', '')),
                    'extraction_date': datetime.now().isoformat(),
                    'dimension': dimension
                }
                scored_results.append(scored_result)
        
        # Sort by relevance score
        scored_results.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        
        logger.info(f"Found {len(scored_results)} relevant results for {company_name} - {dimension}")
        return scored_results
    
    def _scrape_reddit(self, company_name: str, dimension: str) -> List[Dict[str, Any]]:
        """Scrape Reddit for company and dimension-specific content"""
        results = []
        
        for subreddit in self.target_subreddits:
            try:
                # Search for company-specific content
                search_url = self.url_patterns['reddit']['search'].format(
                    subreddit=subreddit,
                    query=company_name
                )
                
                full_url = urljoin(self.url_patterns['reddit']['base_url'], search_url)
                
                self.rate_limiter.wait()
                self.session.headers['User-Agent'] = self.user_agent_rotator.get_user_agent()
                
                response = self.session.get(full_url, timeout=30)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Extract post content (basic implementation)
                    posts = soup.find_all('div', {'data-testid': 'post-container'})
                    
                    for post in posts[:5]:  # Limit to top 5 posts
                        try:
                            title_elem = post.find('h3')
                            content_elem = post.find('div', {'data-testid': 'post-content'})
                            
                            if title_elem and content_elem:
                                title = title_elem.get_text(strip=True)
                                content = content_elem.get_text(strip=True)
                                
                                if company_name.lower() in content.lower():
                                    results.append({
                                        'source_type': 'reddit',
                                        'source_url': full_url,
                                        'title': title,
                                        'content': content,
                                        'subreddit': subreddit,
                                        'company': company_name
                                    })
                        except Exception as e:
                            logger.debug(f"Error parsing Reddit post: {e}")
                            continue
                
            except Exception as e:
                logger.warning(f"Error scraping Reddit subreddit {subreddit}: {e}")
                continue
        
        return results
    
    def _scrape_g2(self, company_name: str, dimension: str) -> List[Dict[str, Any]]:
        """Scrape G2 for company reviews and comparisons"""
        results = []
        
        try:
            # Scrape company reviews
            reviews_url = self.url_patterns['g2']['company_reviews'].format(
                company=company_name.lower().replace(' ', '-')
            )
            
            full_url = urljoin(self.url_patterns['g2']['base_url'], reviews_url)
            
            self.rate_limiter.wait()
            self.session.headers['User-Agent'] = self.user_agent_rotator.get_user_agent()
            
            response = self.session.get(full_url, timeout=30)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract review content (basic implementation)
                reviews = soup.find_all('div', class_='review-content')
                
                for review in reviews[:10]:  # Limit to top 10 reviews
                    try:
                        content = review.get_text(strip=True)
                        
                        if company_name.lower() in content.lower():
                            results.append({
                                'source_type': 'g2',
                                'source_url': full_url,
                                'content': content,
                                'company': company_name
                            })
                    except Exception as e:
                        logger.debug(f"Error parsing G2 review: {e}")
                        continue
                
        except Exception as e:
            logger.warning(f"Error scraping G2 for {company_name}: {e}")
        
        return results
    
    def _scrape_capterra(self, company_name: str, dimension: str) -> List[Dict[str, Any]]:
        """Scrape Capterra for company reviews and alternatives"""
        results = []
        
        try:
            # Scrape company page
            company_url = self.url_patterns['capterra']['company_reviews'].format(
                company=company_name.lower().replace(' ', '-')
            )
            
            full_url = urljoin(self.url_patterns['capterra']['base_url'], company_url)
            
            self.rate_limiter.wait()
            self.session.headers['User-Agent'] = self.user_agent_rotator.get_user_agent()
            
            response = self.session.get(full_url, timeout=30)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract review content (basic implementation)
                reviews = soup.find_all('div', class_='review-content')
                
                for review in reviews[:10]:  # Limit to top 10 reviews
                    try:
                        content = review.get_text(strip=True)
                        
                        if company_name.lower() in content.lower():
                            results.append({
                                'source_type': 'capterra',
                                'source_url': full_url,
                                'content': content,
                                'company': company_name
                            })
                    except Exception as e:
                        logger.debug(f"Error parsing Capterra review: {e}")
                        continue
                
        except Exception as e:
            logger.warning(f"Error scraping Capterra for {company_name}: {e}")
        
        return results
    
    def _scrape_trustradius(self, company_name: str, dimension: str) -> List[Dict[str, Any]]:
        """Scrape TrustRadius for company reviews and alternatives"""
        results = []
        
        try:
            # Scrape company page
            company_url = self.url_patterns['trustradius']['company_reviews'].format(
                company=company_name.lower().replace(' ', '-')
            )
            
            full_url = urljoin(self.url_patterns['trustradius']['base_url'], company_url)
            
            self.rate_limiter.wait()
            self.session.headers['User-Agent'] = self.user_agent_rotator.get_user_agent()
            
            response = self.session.get(full_url, timeout=30)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract review content (basic implementation)
                reviews = soup.find_all('div', class_='review-content')
                
                for review in reviews[:10]:  # Limit to top 10 reviews
                    try:
                        content = review.get_text(strip=True)
                        
                        if company_name.lower() in content.lower():
                            results.append({
                                'source_type': 'trustradius',
                                'source_url': full_url,
                                'content': content,
                                'company': company_name
                            })
                    except Exception as e:
                        logger.debug(f"Error parsing TrustRadius review: {e}")
                        continue
                
        except Exception as e:
            logger.warning(f"Error scraping TrustRadius for {company_name}: {e}")
        
        return results
    
    def scrape_all_competitors_dimension(self, competitors: List[str], dimension: str) -> Dict[str, List[Dict[str, Any]]]:
        """Scrape all competitors for a specific dimension"""
        results = {}
        
        for competitor in competitors:
            logger.info(f"Scraping {competitor} for dimension: {dimension}")
            competitor_results = self.scrape_company_dimension(competitor, dimension)
            results[competitor] = competitor_results
            
            # Add delay between competitors
            time.sleep(2)
        
        return results
    
    def get_scraping_summary(self, results: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        """Generate summary statistics for scraping results"""
        total_companies = len(results)
        total_content = sum(len(company_results) for company_results in results.values())
        
        # Calculate average scores
        relevance_scores = []
        confidence_scores = []
        
        for company_results in results.values():
            for result in company_results:
                if 'relevance_score' in result:
                    relevance_scores.append(result['relevance_score'])
                if 'confidence_score' in result:
                    confidence_scores.append(result['confidence_score'])
        
        avg_relevance = sum(relevance_scores) / len(relevance_scores) if relevance_scores else 0
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        return {
            'total_companies': total_companies,
            'total_content_items': total_content,
            'average_relevance_score': avg_relevance,
            'average_confidence_score': avg_confidence,
            'scraping_timestamp': datetime.now().isoformat()
        }

def main():
    """Test the dynamic bulk scraper"""
    scraper = DynamicBulkScraper()
    
    # Test with a single company and dimension
    test_company = "Snowflake"
    test_dimension = "spreadsheet_interface"
    
    print(f"Testing dynamic scraper for {test_company} - {test_dimension}")
    
    results = scraper.scrape_company_dimension(test_company, test_dimension)
    
    print(f"Found {len(results)} results")
    
    # Print first few results
    for i, result in enumerate(results[:3]):
        print(f"\nResult {i+1}:")
        print(f"Source: {result.get('source_type')}")
        print(f"Content: {result.get('content', '')[:200]}...")
        print(f"Relevance Score: {result.get('relevance_score', 0):.2f}")
        print(f"Confidence: {result.get('confidence_score', 0):.2f}")

if __name__ == "__main__":
    main()
