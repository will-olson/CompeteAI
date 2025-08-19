#!/usr/bin/env python3
"""
Hardcoded Competitor Scraper
Implements precision-targeted scraping based on hardcoded content mapping
Designed to support complete client functionality in the browser
"""

import json
import requests
import time
import random
from datetime import datetime
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HardcodedCompetitorScraper:
    """Hardcoded competitor scraper for precision-targeted content extraction"""
    
    def __init__(self, content_map_file: str = "hardcoded_content_mapping_template.json"):
        """Initialize scraper with content mapping file"""
        self.content_map = self.load_content_map(content_map_file)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.results = {}
        
    def load_content_map(self, content_map_file: str) -> Dict[str, Any]:
        """Load content mapping from JSON file"""
        try:
            with open(content_map_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Content map file {content_map_file} not found. Using empty template.")
            return {"companies": {}, "metadata": {}}
    
    def scrape_url(self, url: str, content_type: str) -> Optional[Dict[str, Any]]:
        """Scrape content from a specific URL"""
        try:
            # Skip placeholder URLs
            if "PLACEHOLDER:" in url:
                return None
                
            logger.info(f"Scraping: {url}")
            response = self.session.get(url, timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract text content
                text_content = self.extract_text_content(soup)
                
                # Score content based on type and technical relevance
                technical_score = self.score_technical_relevance(text_content, content_type)
                strategic_scores = self.score_strategic_dimensions(text_content)
                
                return {
                    'url': url,
                    'content_type': content_type,
                    'raw_content': response.text,
                    'text_content': text_content,
                    'content_length': len(text_content),
                    'technical_score': technical_score,
                    'strategic_scores': strategic_scores,
                    'scraped_at': datetime.now().isoformat(),
                    'status': 'success'
                }
            else:
                logger.warning(f"HTTP {response.status_code} for {url}")
                return {
                    'url': url,
                    'content_type': content_type,
                    'status': f'failed_{response.status_code}',
                    'error': f'HTTP {response.status_code}',
                    'scraped_at': datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            return {
                'url': url,
                'content_type': content_type,
                'status': 'error',
                'error': str(e),
                'scraped_at': datetime.now().isoformat()
            }
    
    def extract_text_content(self, soup: BeautifulSoup) -> str:
        """Extract clean text content from BeautifulSoup object"""
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text and clean it up
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    
    def score_technical_relevance(self, content: str, content_type: str) -> int:
        """Score content based on technical relevance and type"""
        base_scores = {
            'api_documentation': 100,
            'architecture_guides': 90,
            'code_examples': 85,
            'tutorials': 80,
            'developer_portals': 75,
            'integration_docs': 70,
            'blog_posts': 60,
            'product_updates': 50,
            'pricing_pages': 30,
            'reddit_sources': 40,
            'github_sources': 70,
            'rss_feeds': 45
        }
        
        # Additional scoring based on technical keywords
        technical_keywords = [
            'api', 'sdk', 'authentication', 'rate_limit', 'endpoint',
            'rest', 'graphql', 'oauth', 'jwt', 'webhook', 'webhook',
            'database', 'sql', 'nosql', 'etl', 'data_pipeline',
            'kubernetes', 'docker', 'microservices', 'scaling', 'auto-scaling'
        ]
        
        keyword_score = sum(5 for keyword in technical_keywords if keyword in content.lower())
        
        return base_scores.get(content_type, 50) + keyword_score
    
    def score_strategic_dimensions(self, content: str) -> Dict[str, Dict[str, Any]]:
        """Score content against strategic competitive dimensions"""
        dimensions = {
            'api_first_architecture': {
                'keywords': ['api', 'rest', 'graphql', 'sdk', 'endpoint', 'webhook'],
                'score': 0,
                'description': 'API-first design and developer experience'
            },
            'cloud_native_features': {
                'keywords': ['kubernetes', 'docker', 'microservices', 'scaling', 'auto-scaling', 'serverless'],
                'score': 0,
                'description': 'Cloud-native architecture and deployment'
            },
            'data_integration': {
                'keywords': ['etl', 'connector', 'data_pipeline', 'integration', 'api_gateway', 'data_warehouse'],
                'score': 0,
                'description': 'Data integration and pipeline capabilities'
            },
            'developer_experience': {
                'keywords': ['developer', 'sdk', 'documentation', 'tutorial', 'example', 'getting_started'],
                'score': 0,
                'description': 'Developer tools and experience quality'
            },
            'modern_analytics_stack': {
                'keywords': ['analytics', 'bi', 'dashboard', 'visualization', 'machine_learning', 'ai'],
                'score': 0,
                'description': 'Modern analytics and AI capabilities'
            }
        }
        
        # Score each dimension
        for dimension, config in dimensions.items():
            for keyword in config['keywords']:
                if keyword in content.lower():
                    config['score'] += 10
        
        return dimensions
    
    def scrape_company_strategic_content(self, company_name: str) -> Dict[str, Any]:
        """Scrape strategic content for a specific company"""
        company_map = self.content_map.get('companies', {}).get(company_name, {})
        
        if not company_map:
            logger.warning(f"No content mapping found for {company_name}")
            return {'error': f'No content mapping for {company_name}'}
        
        logger.info(f"Scraping strategic content for {company_name}")
        
        results = {
            'company': company_name,
            'domain': company_map.get('domain', ''),
            'scraped_at': datetime.now().isoformat(),
            'content_by_dimension': {},
            'total_technical_score': 0,
            'total_content_length': 0,
            'scraping_summary': {}
        }
        
        content_sources = company_map.get('content_sources', {})
        
        for dimension, urls in content_sources.items():
            if isinstance(urls, list):
                # Handle list of URLs
                dimension_content = []
                for url in urls:
                    content = self.scrape_url(url, dimension)
                    if content:
                        dimension_content.append(content)
                        results['total_content_length'] += content.get('content_length', 0)
                        results['total_technical_score'] += content.get('technical_score', 0)
                
                results['content_by_dimension'][dimension] = dimension_content
                
            elif isinstance(urls, dict):
                # Handle nested structures like RSS feeds, Reddit sources
                dimension_content = {}
                for sub_dimension, sub_urls in urls.items():
                    if isinstance(sub_urls, list):
                        sub_content = []
                        for url in sub_urls:
                            content = self.scrape_url(url, f"{dimension}_{sub_dimension}")
                            if content:
                                sub_content.append(content)
                                results['total_content_length'] += content.get('content_length', 0)
                                results['total_technical_score'] += content.get('technical_score', 0)
                        dimension_content[sub_dimension] = sub_content
                    else:
                        # Handle single URLs
                        content = self.scrape_url(sub_urls, f"{dimension}_{sub_dimension}")
                        if content:
                            dimension_content[sub_dimension] = content
                            results['total_content_length'] += content.get('content_length', 0)
                            results['total_technical_score'] += content.get('technical_score', 0)
                
                results['content_by_dimension'][dimension] = dimension_content
            
            # Add delay to be respectful
            time.sleep(random.uniform(1, 3))
        
        # Generate scraping summary
        results['scraping_summary'] = self.generate_scraping_summary(results)
        
        return results
    
    def generate_scraping_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate summary statistics for scraping results"""
        total_items = 0
        successful_items = 0
        failed_items = 0
        
        for dimension, content in results['content_by_dimension'].items():
            if isinstance(content, list):
                total_items += len(content)
                successful_items += sum(1 for item in content if item.get('status') == 'success')
                failed_items += sum(1 for item in content if item.get('status') != 'success')
            elif isinstance(content, dict):
                for sub_dimension, sub_content in content.items():
                    if isinstance(sub_content, list):
                        total_items += len(sub_content)
                        successful_items += sum(1 for item in sub_content if item.get('status') == 'success')
                        failed_items += sum(1 for item in sub_content if item.get('status') != 'success')
                    else:
                        total_items += 1
                        if sub_content.get('status') == 'success':
                            successful_items += 1
                        else:
                            failed_items += 1
        
        return {
            'total_items': total_items,
            'successful_items': successful_items,
            'failed_items': failed_items,
            'success_rate': (successful_items / total_items * 100) if total_items > 0 else 0,
            'average_technical_score': (results['total_technical_score'] / successful_items) if successful_items > 0 else 0
        }
    
    def scrape_all_competitors(self) -> Dict[str, Any]:
        """Scrape strategic content for all competitors"""
        companies = self.content_map.get('companies', {})
        
        logger.info(f"Starting strategic scraping for {len(companies)} companies")
        
        all_results = {}
        total_start_time = time.time()
        
        for company_name in companies:
            company_start_time = time.time()
            company_results = self.scrape_company_strategic_content(company_name)
            company_results['scraping_time'] = time.time() - company_start_time
            all_results[company_name] = company_results
            
            logger.info(f"Completed {company_name} in {company_results['scraping_time']:.2f}s")
        
        total_time = time.time() - total_start_time
        
        # Generate overall summary
        overall_summary = {
            'total_companies': len(companies),
            'total_scraping_time': total_time,
            'average_company_time': total_time / len(companies) if companies else 0,
            'total_content_length': sum(r.get('total_content_length', 0) for r in all_results.values()),
            'total_technical_score': sum(r.get('total_technical_score', 0) for r in all_results.values()),
            'scraping_timestamp': datetime.now().isoformat()
        }
        
        return {
            'overall_summary': overall_summary,
            'company_results': all_results
        }
    
    def get_company_content_summary(self, company_name: str) -> Dict[str, Any]:
        """Get a summary of scraped content for a specific company"""
        if company_name not in self.results:
            logger.warning(f"No results found for {company_name}. Run scraping first.")
            return {}
        
        company_data = self.results[company_name]
        
        return {
            'company': company_name,
            'total_content_length': company_data.get('total_content_length', 0),
            'total_technical_score': company_data.get('total_technical_score', 0),
            'scraping_summary': company_data.get('scraping_summary', {}),
            'content_dimensions': list(company_data.get('content_by_dimension', {}).keys()),
            'last_scraped': company_data.get('scraped_at', '')
        }
    
    def export_results(self, filename: str = None) -> str:
        """Export scraping results to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"hardcoded_scraping_results_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        logger.info(f"Results exported to {filename}")
        return filename

def main():
    """Main function for testing the hardcoded scraper"""
    scraper = HardcodedCompetitorScraper()
    
    # Test with a single company first
    print("🧪 Testing hardcoded scraper with Snowflake...")
    snowflake_results = scraper.scrape_company_strategic_content("Snowflake")
    
    if 'error' not in snowflake_results:
        print(f"✅ Successfully scraped Snowflake")
        print(f"   - Content length: {snowflake_results.get('total_content_length', 0):,} characters")
        print(f"   - Technical score: {snowflake_results.get('total_technical_score', 0)}")
        print(f"   - Content dimensions: {list(snowflake_results.get('content_by_dimension', {}).keys())}")
        
        # Export results
        filename = scraper.export_results()
        print(f"💾 Results exported to {filename}")
    else:
        print(f"❌ Failed to scrape Snowflake: {snowflake_results['error']}")

if __name__ == "__main__":
    main()
