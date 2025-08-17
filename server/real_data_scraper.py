# real_data_scraper.py
import json
import requests
from datetime import datetime
from typing import Dict, List, Any
from competitor_targeting import COMPETITORS

class RealDataCompetitiveScraper:
    """
    Scraper that prioritizes real data from competitor_targeting.py
    """
    
    def __init__(self):
        self.competitors = COMPETITORS
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def scrape_all_competitors(self) -> Dict[str, Any]:
        """Scrape real data from all competitors in competitor_targeting.py"""
        all_results = {}
        
        for competitor in self.competitors:
            company_name = competitor['name']
            print(f"Scraping {company_name}...")
            
            try:
                company_data = self.scrape_competitor(company_name)
                all_results[company_name] = company_data
            except Exception as e:
                print(f"Error scraping {company_name}: {e}")
                all_results[company_name] = {
                    'error': str(e),
                    'status': 'failed',
                    'timestamp': datetime.now().isoformat()
                }
        
        return all_results
    
    def scrape_competitor(self, company_name: str) -> Dict[str, Any]:
        """Scrape data for a specific competitor"""
        competitor = next((c for c in self.competitors if c['name'] == company_name), None)
        if not competitor:
            raise ValueError(f"Competitor {company_name} not found")
        
        # Scrape existing documentation URLs
        existing_docs = competitor.get('docs', [])
        scraped_docs = []
        
        for doc_url in existing_docs:
            try:
                content = self._scrape_url(doc_url)
                if content:
                    scraped_docs.append({
                        'url': doc_url,
                        'content': content,
                        'source': 'existing_docs',
                        'scraped_at': datetime.now().isoformat()
                    })
            except Exception as e:
                print(f"Error scraping {doc_url}: {e}")
        
        # Analyze scraped content for strategic dimensions
        strategic_analysis = self._analyze_strategic_dimensions(scraped_docs)
        
        return {
            'company_name': company_name,
            'domain': competitor.get('domain', ''),
            'scraped_docs': scraped_docs,
            'strategic_analysis': strategic_analysis,
            'total_docs': len(scraped_docs),
            'scraped_at': datetime.now().isoformat(),
            'status': 'success'
        }
    
    def _scrape_url(self, url: str) -> str:
        """Scrape content from a URL"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Basic content extraction (can be enhanced with BeautifulSoup)
            content = response.text
            
            # Extract text content (remove HTML tags)
            import re
            text_content = re.sub(r'<[^>]+>', '', content)
            text_content = re.sub(r'\s+', ' ', text_content).strip()
            
            return text_content[:10000]  # Limit content length
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return ""
    
    def _analyze_strategic_dimensions(self, scraped_docs: List[Dict]) -> Dict[str, Any]:
        """Analyze scraped content for strategic dimensions"""
        analysis = {
            'api_first_architecture': {'score': 0, 'indicators': 0, 'content_count': 0},
            'cloud_native_features': {'score': 0, 'indicators': 0, 'content_count': 0},
            'data_integration': {'score': 0, 'indicators': 0, 'content_count': 0},
            'developer_experience': {'score': 0, 'indicators': 0, 'content_count': 0},
            'modern_analytics': {'score': 0, 'indicators': 0, 'content_count': 0}
        }
        
        for doc in scraped_docs:
            content = doc.get('content', '').lower()
            
            # API-First Architecture
            api_indicators = ['api', 'endpoint', 'rest', 'graphql', 'sdk', 'authentication']
            api_score = sum(1 for indicator in api_indicators if indicator in content)
            analysis['api_first_architecture']['indicators'] += api_score
            analysis['api_first_architecture']['content_count'] += 1
            
            # Cloud-Native Features
            cloud_indicators = ['cloud', 'scaling', 'serverless', 'container', 'multi-cloud']
            cloud_score = sum(1 for indicator in cloud_indicators if indicator in content)
            analysis['cloud_native_features']['indicators'] += cloud_score
            analysis['cloud_native_features']['content_count'] += 1
            
            # Data Integration
            integration_indicators = ['connector', 'pipeline', 'etl', 'streaming', 'real-time']
            integration_score = sum(1 for indicator in integration_indicators if indicator in content)
            analysis['data_integration']['indicators'] += integration_score
            analysis['data_integration']['content_count'] += 1
            
            # Developer Experience
            dev_indicators = ['tutorial', 'example', 'getting started', 'sample', 'playground']
            dev_score = sum(1 for indicator in dev_indicators if indicator in content)
            analysis['developer_experience']['indicators'] += dev_score
            analysis['developer_experience']['content_count'] += 1
            
            # Modern Analytics
            analytics_indicators = ['ai', 'ml', 'machine learning', 'collaboration', 'insights']
            analytics_score = sum(1 for indicator in analytics_indicators if indicator in content)
            analysis['modern_analytics']['indicators'] += analytics_score
            analysis['modern_analytics']['content_count'] += 1
        
        # Calculate scores
        for dimension in analysis:
            if analysis[dimension]['content_count'] > 0:
                analysis[dimension]['score'] = min(100, 
                    (analysis[dimension]['indicators'] / analysis[dimension]['content_count']) * 20)
        
        return analysis

# Test the scraper
if __name__ == "__main__":
    scraper = RealDataCompetitiveScraper()
    results = scraper.scrape_all_competitors()
    
    print("\n=== Real Data Scraping Results ===")
    for company, data in results.items():
        if data.get('status') == 'success':
            print(f"\n{company}:")
            print(f"  - Total docs: {data.get('total_docs', 0)}")
            print(f"  - API Score: {data.get('strategic_analysis', {}).get('api_first_architecture', {}).get('score', 0):.1f}")
            print(f"  - Cloud Score: {data.get('strategic_analysis', {}).get('cloud_native_features', {}).get('score', 0):.1f}")
        else:
            print(f"\n{company}: {data.get('error', 'Unknown error')}")
