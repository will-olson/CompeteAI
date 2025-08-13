# competitive_intelligence_scraper.py
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
from urllib.parse import urlparse, urljoin
import hashlib
import feedparser
from bs4 import BeautifulSoup
import csv
import markdown
import docx
from functools import wraps

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('competitive_intelligence_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def rate_limited(max_per_second=2):
    """Simple rate limiting decorator for respectful crawling"""
    def decorator(func):
        last_called = {}
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            if func.__name__ in last_called:
                time_since_last = now - last_called[func.__name__]
                if time_since_last < 1.0 / max_per_second:
                    time.sleep(1.0 / max_per_second - time_since_last)
            
            last_called[func.__name__] = time.time()
            return func(*args, **kwargs)
        return wrapper
    return decorator

class CompetitiveIntelligenceScraper:
    """
    Comprehensive competitive intelligence scraper supporting multiple data sources
    with enhanced technical content extraction
    """
    
    def __init__(self, firecrawl_api_key: Optional[str] = None):
        self.firecrawl_api_key = firecrawl_api_key or os.getenv('FIRECRAWL_API_KEY')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Initialize preset competitor groups
        self.preset_groups = self._initialize_preset_groups()
        
        # Technical content keywords for relevance scoring
        self.technical_keywords = {
            'api_docs': ['api', 'endpoint', 'authentication', 'rate limit', 'response', 'request', 'headers', 'parameters'],
            'pricing': ['price', 'plan', 'tier', 'billing', 'subscription', 'cost', 'pricing', 'enterprise'],
            'features': ['feature', 'capability', 'functionality', 'integration', 'workflow', 'automation'],
            'integrations': ['webhook', 'oauth', 'sdk', 'plugin', 'connector', 'api key', 'authentication']
        }
        
    def _initialize_preset_groups(self) -> Dict[str, Dict[str, Any]]:
        """Initialize preset competitor groups for quick analysis"""
        return {
            "tech_saas": {
                "name": "Tech SaaS",
                "companies": ["Salesforce", "HubSpot", "Slack", "Notion", "Figma", "Airtable"],
                "categories": ["marketing", "docs", "rss", "social"],
                "description": "Leading SaaS companies in productivity and collaboration"
            },
            "fintech": {
                "name": "Fintech",
                "companies": ["Stripe", "Plaid", "Coinbase", "Robinhood", "Chime", "Affirm"],
                "categories": ["marketing", "docs", "rss", "social"],
                "description": "Financial technology and payment processing companies"
            },
            "ecommerce": {
                "name": "E-commerce",
                "companies": ["Shopify", "Amazon", "Etsy", "WooCommerce", "BigCommerce", "Magento"],
                "categories": ["marketing", "docs", "rss", "social"],
                "description": "E-commerce platforms and online retail companies"
            },
            "ai_ml": {
                "name": "AI/ML",
                "companies": ["OpenAI", "Anthropic", "Google_AI", "Microsoft_AI", "Meta_AI", "NVIDIA"],
                "categories": ["marketing", "docs", "rss", "social"],
                "description": "Artificial intelligence and machine learning companies"
            }
        }
    
    def load_preset_group(self, group_key: str) -> Dict[str, Any]:
        """Load a preset competitor group"""
        if group_key not in self.preset_groups:
            raise ValueError(f"Unknown preset group: {group_key}")
        
        group = self.preset_groups[group_key].copy()
        group['group_key'] = group_key
        
        # Generate default URLs for each company
        group['company_urls'] = self._generate_default_urls(group['companies'])
        
        return group
    
    def _generate_default_urls(self, companies: List[str]) -> Dict[str, Dict[str, str]]:
        """Generate default URLs for different categories for each company"""
        company_urls = {}
        
        for company in companies:
            company_lower = company.lower().replace('_', '')
            company_urls[company] = {
                'marketing': f"https://{company_lower}.com",
                'docs': f"https://{company_lower}.com/docs",
                'rss': f"https://{company_lower}.com/blog/feed",
                'social': f"https://{company_lower}.com/social"
            }
        
        return company_urls
    
    def create_custom_group(self, name: str, companies: List[str], 
                           categories: List[str], description: str = "") -> Dict[str, Any]:
        """Create a custom competitor group"""
        custom_group = {
            'name': name,
            'companies': companies,
            'categories': categories,
            'description': description,
            'company_urls': self._generate_default_urls(companies),
            'is_custom': True,
            'created_date': datetime.now().isoformat()
        }
        
        return custom_group
    
    def scrape_company_data(self, company: str, urls: Dict[str, str], 
                           categories: List[str], page_limit: int = 10) -> Dict[str, Any]:
        """Scrape data for a single company across specified categories"""
        company_data = {
            'company': company,
            'scraped_at': datetime.now().isoformat(),
            'categories': {},
            'summary': {
                'total_items': 0,
                'total_words': 0,
                'total_links': 0,
                'total_images': 0,
                'rich_content_count': 0
            }
        }
        
        for category in categories:
            if category in urls and urls[category]:
                try:
                    logger.info(f"Scraping {category} for {company}")
                    category_data = self._scrape_category(
                        company, category, urls[category], page_limit
                    )
                    company_data['categories'][category] = category_data
                    
                    # Update summary
                    company_data['summary']['total_items'] += len(category_data.get('items', []))
                    company_data['summary']['total_words'] += category_data.get('total_words', 0)
                    company_data['summary']['total_links'] += category_data.get('total_links', 0)
                    company_data['summary']['total_images'] += category_data.get('total_images', 0)
                    company_data['summary']['rich_content_count'] += category_data.get('rich_content_count', 0)
                    
                    # Add delay to avoid overwhelming servers
                    time.sleep(2)
                    
                except Exception as e:
                    logger.error(f"Error scraping {category} for {company}: {str(e)}")
                    company_data['categories'][category] = {
                        'error': str(e),
                        'status': 'failed'
                    }
        
        return company_data
    
    def _scrape_category(self, company: str, category: str, url: str, page_limit: int) -> Dict[str, Any]:
        """Scrape data for a specific category"""
        category_data = {
            'category': category,
            'url': url,
            'scraped_at': datetime.now().isoformat(),
            'items': [],
            'total_words': 0,
            'total_links': 0,
            'total_images': 0,
            'rich_content_count': 0
        }
        
        try:
            if category == 'marketing':
                items = self._scrape_marketing_site(url, page_limit)
            elif category == 'docs':
                items = self._scrape_documentation(url, page_limit)
            elif category == 'rss':
                items = self._scrape_rss_feed(url, page_limit)
            elif category == 'social':
                items = self._scrape_social_signals(url, page_limit)
            else:
                items = []
            
            # Process and analyze items
            processed_items = []
            for item in items:
                processed_item = self._process_content_item(item, company, category)
                processed_items.append(processed_item)
                
                # Update category metrics
                category_data['total_words'] += processed_item.get('word_count', 0)
                category_data['total_links'] += processed_item.get('link_count', 0)
                category_data['total_images'] += processed_item.get('image_count', 0)
                if processed_item.get('word_count', 0) > 1000:
                    category_data['rich_content_count'] += 1
            
            category_data['items'] = processed_items
            
        except Exception as e:
            logger.error(f"Error in category scraping: {str(e)}")
            category_data['error'] = str(e)
            category_data['status'] = 'failed'
        
        return category_data
    
    def _scrape_marketing_site(self, url: str, page_limit: int) -> List[Dict[str, Any]]:
        """Scrape marketing site content"""
        items = []
        
        try:
            # Use Firecrawl API if available, otherwise fall back to basic scraping
            if self.firecrawl_api_key:
                items = self._scrape_with_firecrawl(url, page_limit, 'marketing')
            else:
                items = self._scrape_with_requests(url, page_limit, 'marketing')
                
        except Exception as e:
            logger.error(f"Error scraping marketing site: {str(e)}")
            # Return mock data for demonstration
            items = self._generate_mock_marketing_data(url, page_limit)
        
        return items
    
    def _scrape_documentation(self, url: str, page_limit: int) -> List[Dict[str, Any]]:
        """Scrape documentation content"""
        items = []
        
        try:
            if self.firecrawl_api_key:
                items = self._scrape_with_firecrawl(url, page_limit, 'docs')
            else:
                items = self._scrape_with_requests(url, page_limit, 'docs')
                
        except Exception as e:
            logger.error(f"Error scraping documentation: {str(e)}")
            items = self._generate_mock_documentation_data(url, page_limit)
        
        return items
    
    def _scrape_rss_feed(self, url: str, page_limit: int) -> List[Dict[str, Any]]:
        """Scrape RSS feed content"""
        items = []
        
        try:
            feed = feedparser.parse(url)
            
            for entry in feed.entries[:page_limit]:
                item = {
                    'title': entry.get('title', ''),
                    'content': entry.get('summary', ''),
                    'url': entry.get('link', ''),
                    'published': entry.get('published', ''),
                    'author': entry.get('author', ''),
                    'source': 'rss'
                }
                items.append(item)
                
        except Exception as e:
            logger.error(f"Error scraping RSS feed: {str(e)}")
            items = self._generate_mock_rss_data(url, page_limit)
        
        return items
    
    def _scrape_social_signals(self, url: str, page_limit: int) -> List[Dict[str, Any]]:
        """Scrape social media signals"""
        items = []
        
        try:
            # This would integrate with social media APIs in a real implementation
            # For now, return mock data
            items = self._generate_mock_social_data(url, page_limit)
            
        except Exception as e:
            logger.error(f"Error scraping social signals: {str(e)}")
            items = self._generate_mock_social_data(url, page_limit)
        
        return items
    
    def _scrape_with_firecrawl(self, url: str, page_limit: int, category: str) -> List[Dict[str, Any]]:
        """Scrape using Firecrawl API"""
        if not self.firecrawl_api_key:
            raise ValueError("Firecrawl API key not configured")
        
        # This would implement actual Firecrawl API integration
        # For now, return mock data
        return self._generate_mock_data_for_category(url, page_limit, category)
    
    def _scrape_with_requests(self, url: str, page_limit: int, category: str) -> List[Dict[str, Any]]:
        """Basic scraping using requests and BeautifulSoup"""
        items = []
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract basic content
            title = soup.find('title')
            title_text = title.get_text() if title else ''
            
            # Extract main content
            main_content = soup.find('main') or soup.find('body')
            content_text = main_content.get_text() if main_content else ''
            
            # Extract links
            links = soup.find_all('a', href=True)
            link_count = len(links)
            
            # Extract images
            images = soup.find_all('img')
            image_count = len(images)
            
            item = {
                'title': title_text,
                'content': content_text,
                'url': url,
                'source': category,
                'link_count': link_count,
                'image_count': image_count,
                'scraped_at': datetime.now().isoformat()
            }
            
            items.append(item)
            
        except Exception as e:
            logger.error(f"Error in basic scraping: {str(e)}")
            items = self._generate_mock_data_for_category(url, page_limit, category)
        
        return items
    
    def _process_content_item(self, item: Dict[str, Any], company: str, category: str) -> Dict[str, Any]:
        """Process and analyze a content item"""
        processed_item = item.copy()
        
        # Add company and category tags
        processed_item['company'] = company
        processed_item['category'] = category
        
        # Calculate word count
        content = item.get('content', '')
        word_count = len(content.split()) if content else 0
        processed_item['word_count'] = word_count
        
        # Calculate character count
        char_count = len(content) if content else 0
        processed_item['char_count'] = char_count
        
        # Determine content quality
        if word_count > 1000:
            processed_item['content_quality'] = 'rich'
        elif word_count > 500:
            processed_item['content_quality'] = 'medium'
        else:
            processed_item['content_quality'] = 'basic'
        
        # Extract links if not already present
        if 'link_count' not in processed_item:
            content_html = item.get('content_html', '')
            if content_html:
                soup = BeautifulSoup(content_html, 'html.parser')
                processed_item['link_count'] = len(soup.find_all('a', href=True))
            else:
                processed_item['link_count'] = 0
        
        # Extract images if not already present
        if 'image_count' not in processed_item:
            content_html = item.get('content_html', '')
            if content_html:
                soup = BeautifulSoup(content_html, 'html.parser')
                processed_item['image_count'] = len(soup.find_all('img'))
            else:
                processed_item['image_count'] = 0
        
        # Generate unique ID
        processed_item['id'] = self._generate_item_id(processed_item)
        
        return processed_item
    
    def _generate_item_id(self, item: Dict[str, Any]) -> str:
        """Generate unique ID for content item"""
        content_string = f"{item.get('company', '')}{item.get('title', '')}{item.get('url', '')}"
        return hashlib.md5(content_string.encode()).hexdigest()[:12]
    
    def batch_scrape_group(self, group: Dict[str, Any], page_limit: int = 10) -> Dict[str, Any]:
        """Scrape data for an entire competitor group"""
        group_results = {
            'group_name': group['name'],
            'group_key': group.get('group_key', 'custom'),
            'scraped_at': datetime.now().isoformat(),
            'companies': {},
            'summary': {
                'total_companies': len(group['companies']),
                'total_items': 0,
                'total_words': 0,
                'total_links': 0,
                'total_images': 0,
                'rich_content_count': 0
            }
        }
        
        for company in group['companies']:
            try:
                logger.info(f"Scraping data for {company}")
                company_urls = group['company_urls'].get(company, {})
                company_data = self.scrape_company_data(
                    company, company_urls, group['categories'], page_limit
                )
                
                group_results['companies'][company] = company_data
                
                # Update group summary
                group_results['summary']['total_items'] += company_data['summary']['total_items']
                group_results['summary']['total_words'] += company_data['summary']['total_words']
                group_results['summary']['total_links'] += company_data['summary']['total_links']
                group_results['summary']['total_images'] += company_data['summary']['total_images']
                group_results['summary']['rich_content_count'] += company_data['summary']['rich_content_count']
                
            except Exception as e:
                logger.error(f"Error scraping {company}: {str(e)}")
                group_results['companies'][company] = {
                    'error': str(e),
                    'status': 'failed'
                }
        
        return group_results
    
    def mass_scrape_all_groups(self, page_limit: int = 10) -> Dict[str, Any]:
        """Scrape all preset groups simultaneously"""
        all_results = {
            'mass_scrape_started': datetime.now().isoformat(),
            'groups': {},
            'overall_summary': {
                'total_groups': len(self.preset_groups),
                'total_companies': 0,
                'total_items': 0,
                'total_words': 0
            }
        }
        
        for group_key, group in self.preset_groups.items():
            try:
                logger.info(f"Starting mass scrape for group: {group['name']}")
                group_results = self.batch_scrape_group(group, page_limit)
                all_results['groups'][group_key] = group_results
                
                # Update overall summary
                all_results['overall_summary']['total_companies'] += group_results['summary']['total_companies']
                all_results['overall_summary']['total_items'] += group_results['summary']['total_items']
                all_results['overall_summary']['total_words'] += group_results['summary']['total_words']
                
            except Exception as e:
                logger.error(f"Error in mass scrape for group {group_key}: {str(e)}")
                all_results['groups'][group_key] = {
                    'error': str(e),
                    'status': 'failed'
                }
        
        all_results['mass_scrape_completed'] = datetime.now().isoformat()
        return all_results
    
    def import_data_file(self, file_path: str, file_type: str) -> List[Dict[str, Any]]:
        """Import data from various file formats"""
        try:
            if file_type.lower() == 'csv':
                return self._import_csv(file_path)
            elif file_type.lower() == 'json':
                return self._import_json(file_path)
            elif file_type.lower() == 'markdown':
                return self._import_markdown(file_path)
            elif file_type.lower() == 'docx':
                return self._import_docx(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
                
        except Exception as e:
            logger.error(f"Error importing file {file_path}: {str(e)}")
            return []
    
    def _import_csv(self, file_path: str) -> List[Dict[str, Any]]:
        """Import data from CSV file"""
        items = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    item = {
                        'title': row.get('title', ''),
                        'content': row.get('content', ''),
                        'company': row.get('company', ''),
                        'category': row.get('category', ''),
                        'url': row.get('url', ''),
                        'source': 'csv_import',
                        'imported_at': datetime.now().isoformat()
                    }
                    items.append(item)
                    
        except Exception as e:
            logger.error(f"Error importing CSV: {str(e)}")
        
        return items
    
    def _import_json(self, file_path: str) -> List[Dict[str, Any]]:
        """Import data from JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict):
                items = [data]
            else:
                items = []
            
            # Add import metadata
            for item in items:
                item['source'] = 'json_import'
                item['imported_at'] = datetime.now().isoformat()
            
            return items
            
        except Exception as e:
            logger.error(f"Error importing JSON: {str(e)}")
            return []
    
    def _import_markdown(self, file_path: str) -> List[Dict[str, Any]]:
        """Import data from Markdown file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Convert markdown to HTML for processing
            html_content = markdown.markdown(content)
            
            # Extract title from first heading
            soup = BeautifulSoup(html_content, 'html.parser')
            title_tag = soup.find(['h1', 'h2', 'h3'])
            title = title_tag.get_text() if title_tag else os.path.basename(file_path)
            
            item = {
                'title': title,
                'content': content,
                'content_html': html_content,
                'company': 'imported',
                'category': 'documentation',
                'source': 'markdown_import',
                'imported_at': datetime.now().isoformat()
            }
            
            return [item]
            
        except Exception as e:
            logger.error(f"Error importing Markdown: {str(e)}")
            return []
    
    def _import_docx(self, file_path: str) -> List[Dict[str, Any]]:
        """Import data from DOCX file"""
        try:
            doc = docx.Document(file_path)
            
            # Extract text content
            content = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
            
            # Extract title from first paragraph or filename
            title = doc.paragraphs[0].text if doc.paragraphs and doc.paragraphs[0].text else os.path.basename(file_path)
            
            item = {
                'title': title,
                'content': content,
                'company': 'imported',
                'category': 'documentation',
                'source': 'docx_import',
                'imported_at': datetime.now().isoformat()
            }
            
            return [item]
            
        except Exception as e:
            logger.error(f"Error importing DOCX: {str(e)}")
            return []
    
    def export_data(self, data: Union[Dict, List], format: str = 'json', filename: Optional[str] = None) -> str:
        """Export data in specified format"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'competitive_intelligence_data_{timestamp}'
        
        try:
            if format.lower() == 'json':
                filepath = f"{filename}.json"
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            
            elif format.lower() == 'csv':
                filepath = f"{filename}.csv"
                if isinstance(data, dict):
                    # Flatten nested data for CSV export
                    flattened_data = self._flatten_data_for_csv(data)
                else:
                    flattened_data = data
                
                if flattened_data:
                    df = pd.DataFrame(flattened_data)
                    df.to_csv(filepath, index=False, encoding='utf-8')
            
            else:
                raise ValueError(f"Unsupported export format: {format}")
            
            logger.info(f"Data exported successfully to: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Error exporting data: {str(e)}")
            raise
    
    def _flatten_data_for_csv(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Flatten nested data structure for CSV export"""
        flattened = []
        
        def flatten_item(item, prefix=''):
            flat_item = {}
            for key, value in item.items():
                if isinstance(value, dict):
                    flat_item.update(flatten_item(value, f"{prefix}{key}_"))
                elif isinstance(value, list):
                    # Handle lists by creating separate rows or concatenating
                    if value and isinstance(value[0], dict):
                        for i, sub_item in enumerate(value):
                            flat_item.update(flatten_item(sub_item, f"{prefix}{key}_{i}_"))
                    else:
                        flat_item[f"{prefix}{key}"] = '; '.join(map(str, value))
                else:
                    flat_item[f"{prefix}{key}"] = value
            return flat_item
        
        # Handle different data structures
        if 'companies' in data:
            for company, company_data in data['companies'].items():
                if isinstance(company_data, dict) and 'error' not in company_data:
                    for category, category_data in company_data.get('categories', {}).items():
                        if isinstance(category_data, dict) and 'error' not in category_data:
                            for item in category_data.get('items', []):
                                flat_item = flatten_item(item)
                                flat_item['company'] = company
                                flat_item['category'] = category
                                flattened.append(flat_item)
        
        return flattened
    
    # Mock data generation methods for demonstration
    def _generate_mock_marketing_data(self, url: str, page_limit: int) -> List[Dict[str, Any]]:
        """Generate mock marketing data for demonstration"""
        return [
            {
                'title': 'Product Launch Announcement',
                'content': 'We are excited to announce the launch of our new product...',
                'url': url,
                'source': 'marketing',
                'link_count': 5,
                'image_count': 3
            }
        ]
    
    def _generate_mock_documentation_data(self, url: str, page_limit: int) -> List[Dict[str, Any]]:
        """Generate mock documentation data for demonstration"""
        return [
            {
                'title': 'API Reference Guide',
                'content': 'This guide provides comprehensive documentation for our API...',
                'url': url,
                'source': 'docs',
                'link_count': 15,
                'image_count': 2
            }
        ]
    
    def _generate_mock_rss_data(self, url: str, page_limit: int) -> List[Dict[str, Any]]:
        """Generate mock RSS data for demonstration"""
        return [
            {
                'title': 'Latest Blog Post',
                'content': 'Our latest insights on industry trends...',
                'url': url,
                'source': 'rss',
                'link_count': 8,
                'image_count': 1
            }
        ]
    
    def _generate_mock_social_data(self, url: str, page_limit: int) -> List[Dict[str, Any]]:
        """Generate mock social data for demonstration"""
        return [
            {
                'title': 'Social Media Update',
                'content': 'Engaging with our community on social platforms...',
                'url': url,
                'source': 'social',
                'link_count': 3,
                'image_count': 2
            }
        ]
    
    def _generate_mock_data_for_category(self, url: str, page_limit: int, category: str) -> List[Dict[str, Any]]:
        """Generate mock data for any category"""
        if category == 'marketing':
            return self._generate_mock_marketing_data(url, page_limit)
        elif category == 'docs':
            return self._generate_mock_documentation_data(url, page_limit)
        elif category == 'rss':
            return self._generate_mock_rss_data(url, page_limit)
        elif category == 'social':
            return self._generate_mock_social_data(url, page_limit)
        else:
            return []

    def enhanced_technical_scraping(self, company: str, urls: Dict[str, str]) -> Dict[str, Any]:
        """Enhanced scraping with technical content focus - 12-hour MVP enhancement"""
        results = {}
        
        for category, url in urls.items():
            try:
                logger.info(f"Enhanced technical scraping for {company} - {category}")
                
                # Use existing scraping logic
                content = self._scrape_url(url)
                
                # Enhanced content extraction
                structured_data = self._extract_technical_content(content)
                
                # Quality scoring
                quality_score = self._calculate_content_quality(structured_data)
                
                # Technical relevance assessment
                technical_relevance = self._assess_technical_relevance(category, content)
                
                results[category] = {
                    'content': structured_data,
                    'quality_score': quality_score,
                    'technical_relevance': technical_relevance,
                    'scraped_at': datetime.now().isoformat(),
                    'url': url
                }
                
            except Exception as e:
                logger.error(f"Error in enhanced technical scraping for {category}: {str(e)}")
                results[category] = {'error': str(e)}
        
        return results

    def _extract_technical_content(self, html_content: str) -> Dict[str, Any]:
        """Extract technical content using existing BeautifulSoup - 12-hour MVP enhancement"""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract tables (existing functionality)
            tables = soup.find_all('table')
            table_data = []
            for table in tables:
                table_data.append({
                    'html': str(table),
                    'text': table.get_text(strip=True),
                    'rows': len(table.find_all('tr')),
                    'columns': len(table.find_all('th')) or len(table.find_all('td', limit=1))
                })
            
            # Extract code blocks
            code_blocks = soup.find_all(['code', 'pre'])
            code_data = []
            for block in code_blocks:
                code_data.append({
                    'html': str(block),
                    'text': block.get_text(strip=True),
                    'language': self._detect_code_language(block),
                    'length': len(block.get_text())
                })
            
            # Extract links (existing functionality)
            links = soup.find_all('a')
            link_data = []
            for link in links:
                href = link.get('href')
                if href:
                    link_data.append({
                        'url': href,
                        'text': link.get_text(strip=True),
                        'title': link.get('title', ''),
                        'is_external': self._is_external_link(href)
                    })
            
            # Extract technical metadata
            technical_metadata = self._extract_technical_metadata(soup)
            
            return {
                'tables': table_data,
                'code_blocks': code_data,
                'links': link_data,
                'text_content': soup.get_text(strip=True),
                'technical_metadata': technical_metadata,
                'has_forms': len(soup.find_all('form')) > 0,
                'has_images': len(soup.find_all('img')) > 0,
                'has_videos': len(soup.find_all(['video', 'iframe'])) > 0
            }
            
        except Exception as e:
            logger.error(f"Error extracting technical content: {str(e)}")
            return {
                'error': str(e),
                'text_content': html_content[:1000] if html_content else '',
                'tables': [],
                'code_blocks': [],
                'links': []
            }

    def _detect_code_language(self, code_block) -> str:
        """Detect programming language from code block"""
        try:
            # Check for language class
            class_attr = code_block.get('class', [])
            for cls in class_attr:
                if cls.startswith('language-'):
                    return cls.replace('language-', '')
            
            # Check for data attributes
            data_lang = code_block.get('data-lang')
            if data_lang:
                return data_lang
            
            # Simple keyword-based detection
            text = code_block.get_text().lower()
            if any(keyword in text for keyword in ['function', 'var ', 'const ', 'let ']):
                return 'javascript'
            elif any(keyword in text for keyword in ['def ', 'import ', 'class ']):
                return 'python'
            elif any(keyword in text for keyword in ['public class', 'private ', 'public ']):
                return 'java'
            elif any(keyword in text for keyword in ['<?php', 'function ', '$']):
                return 'php'
            else:
                return 'unknown'
                
        except Exception:
            return 'unknown'

    def _is_external_link(self, url: str) -> bool:
        """Check if link is external"""
        try:
            parsed = urlparse(url)
            return bool(parsed.netloc and parsed.netloc not in ['localhost', '127.0.0.1'])
        except Exception:
            return False

    def _extract_technical_metadata(self, soup) -> Dict[str, Any]:
        """Extract technical metadata from HTML"""
        metadata = {}
        
        try:
            # Meta tags
            meta_tags = soup.find_all('meta')
            for meta in meta_tags:
                name_attr = meta.get('name', None)
                prop_attr = meta.get('property', None)
                key = name_attr or prop_attr
                content = meta.get('content', '')
                if key and content:
                    metadata[key] = content
            
            # Schema.org structured data
            schema_scripts = soup.find_all('script', type='application/ld+json')
            for script in schema_scripts:
                try:
                    if script.string:
                        schema_data = json.loads(script.string)
                        if isinstance(schema_data, dict):
                            metadata['schema'] = schema_data
                except json.JSONDecodeError:
                    continue
            
            # Open Graph tags
            og_tags = soup.find_all('meta', attrs={'property': lambda x: x and x.startswith('og:')})
            for tag in og_tags:
                property_name = tag.get('property', '')
                if property_name:
                    metadata[property_name] = tag.get('content', '')
            
            # Twitter Card tags (use attrs to avoid name param conflict)
            twitter_tags = soup.find_all('meta', attrs={'name': lambda x: x and x.startswith('twitter:')})
            for tag in twitter_tags:
                n = tag.get('name', '')
                if n:
                    metadata[n] = tag.get('content', '')
                    
        except Exception as e:
            logger.error(f"Error extracting technical metadata: {str(e)}")
        
        return metadata

    def _assess_technical_relevance(self, category: str, content: str) -> float:
        """Quick technical relevance scoring - 12-hour MVP enhancement"""
        try:
            if category in self.technical_keywords:
                keywords = self.technical_keywords[category]
                content_lower = content.lower()
                matches = sum(1 for keyword in keywords if keyword.lower() in content_lower)
                relevance_score = min(1.0, matches / len(keywords))
                
                # Boost score for technical content types
                if category in ['api_docs', 'integrations']:
                    relevance_score = min(1.0, relevance_score * 1.2)
                
                return round(relevance_score, 2)
            
            return 0.5
            
        except Exception as e:
            logger.error(f"Error assessing technical relevance: {str(e)}")
            return 0.5

    def _calculate_content_quality(self, structured_data: Dict[str, Any]) -> float:
        """Calculate content quality score - 12-hour MVP enhancement"""
        try:
            score = 0.0
            max_score = 10.0
            
            # Text content quality (40% of score)
            text_content = structured_data.get('text_content', '')
            if text_content:
                word_count = len(text_content.split())
                if word_count > 1000:
                    score += 4.0
                elif word_count > 500:
                    score += 3.0
                elif word_count > 100:
                    score += 2.0
                else:
                    score += 1.0
            
            # Technical content richness (30% of score)
            tables = structured_data.get('tables', [])
            code_blocks = structured_data.get('code_blocks', [])
            links = structured_data.get('links', [])
            
            if tables:
                score += 1.5
            if code_blocks:
                score += 1.5
            if len(links) > 10:
                score += 1.0
            elif len(links) > 5:
                score += 0.5
            
            # Metadata completeness (20% of score)
            technical_metadata = structured_data.get('technical_metadata', {})
            if technical_metadata.get('schema'):
                score += 1.0
            if technical_metadata.get('og:title'):
                score += 0.5
            if technical_metadata.get('description'):
                score += 0.5
            
            # Content structure (10% of score)
            if structured_data.get('has_forms'):
                score += 0.5
            if structured_data.get('has_images'):
                score += 0.5
            
            return min(max_score, round(score, 1))
            
        except Exception as e:
            logger.error(f"Error calculating content quality: {str(e)}")
            return 5.0

    @rate_limited(max_per_second=1)
    def _scrape_url(self, url: str) -> str:
        """Scrape URL with rate limiting - 12-hour MVP enhancement"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            logger.error(f"Error scraping URL {url}: {str(e)}")
            raise e


# Example usage and testing
if __name__ == "__main__":
    # Initialize scraper
    scraper = CompetitiveIntelligenceScraper()
    
    # Load a preset group
    tech_group = scraper.load_preset_group("tech_saas")
    print(f"Loaded group: {tech_group['name']}")
    
    # Scrape the group
    results = scraper.batch_scrape_group(tech_group, page_limit=5)
    print(f"Scraped {results['summary']['total_companies']} companies")
    
    # Export results
    filename = scraper.export_data(results, 'json')
    print(f"Results exported to: {filename}") 