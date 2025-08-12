# tech_companies_scraper.py
import os
import json
import random
import pandas as pd
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import logging
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import hashlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TechCompaniesScraper:
    def __init__(self):
        # Set up Chrome options
        chrome_options = Options()
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--disable-notifications')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        # chrome_options.add_argument('--headless')  # Uncomment for headless mode
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def load_tech_companies(self, json_path='tech_companies.json'):
        """
        Load the comprehensive list of tech companies
        """
        try:
            with open(json_path, 'r') as file:
                return json.load(file)
        except Exception as e:
            logger.error(f"Error loading tech companies: {str(e)}")
            return {}

    def generate_company_urls(self, company_name: str) -> dict:
        """
        Generate dynamic URLs for different company categories
        Similar to the financial scraper's approach but for tech companies
        """
        # Clean company name for URL generation
        clean_name = company_name.lower().replace('_', '').replace(' ', '')
        
        # Common URL patterns for tech companies
        url_patterns = {
            'marketing': [
                f'https://{clean_name}.com',
                f'https://www.{clean_name}.com',
                f'https://{clean_name}.io',
                f'https://{clean_name}.ai',
                f'https://{clean_name}.tech'
            ],
            'docs': [
                f'https://{clean_name}.com/docs',
                f'https://docs.{clean_name}.com',
                f'https://developer.{clean_name}.com',
                f'https://{clean_name}.com/developers',
                f'https://{clean_name}.com/api'
            ],
            'rss': [
                f'https://{clean_name}.com/blog/feed',
                f'https://{clean_name}.com/feed',
                f'https://{clean_name}.com/news/feed',
                f'https://{clean_name}.com/updates/feed',
                f'https://{clean_name}.com/insights/feed'
            ],
            'social': [
                f'https://{clean_name}.com/social',
                f'https://{clean_name}.com/community',
                f'https://{clean_name}.com/connect',
                f'https://{clean_name}.com/network',
                f'https://{clean_name}.com/partners'
            ]
        }
        
        return url_patterns

    def test_url_accessibility(self, url: str) -> bool:
        """
        Test if a URL is accessible
        """
        try:
            response = self.session.head(url, timeout=10, allow_redirects=True)
            return response.status_code == 200
        except:
            return False

    def find_working_url(self, urls: list) -> str:
        """
        Find the first working URL from a list
        """
        for url in urls:
            if self.test_url_accessibility(url):
                return url
        return ""

    def scrape_company_website(self, company_name: str, category: str, url: str) -> dict:
        """
        Scrape a specific company website category
        """
        try:
            logger.info(f"Scraping {category} for {company_name} at {url}")
            
            # Use Selenium for dynamic content
            self.driver.get(url)
            time.sleep(3)  # Allow page to load
            
            # Extract page information
            page_data = {
                'company': company_name,
                'category': category,
                'url': url,
                'title': self.driver.title,
                'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
                'content': {},
                'metadata': {}
            }
            
            # Extract main content
            try:
                # Look for main content areas
                main_content = self.driver.find_element(By.TAG_NAME, 'body').text
                page_data['content']['main_text'] = main_content[:5000]  # Limit content
            except:
                page_data['content']['main_text'] = "Content extraction failed"
            
            # Extract links
            try:
                links = self.driver.find_elements(By.TAG_NAME, 'a')
                page_data['content']['link_count'] = len(links)
                page_data['content']['links'] = [link.get_attribute('href') for link in links[:20]]  # Limit links
            except:
                page_data['content']['link_count'] = 0
                page_data['content']['links'] = []
            
            # Extract images
            try:
                images = self.driver.find_elements(By.TAG_NAME, 'img')
                page_data['content']['image_count'] = len(images)
            except:
                page_data['content']['image_count'] = 0
            
            # Extract meta information
            try:
                meta_tags = self.driver.find_elements(By.TAG_NAME, 'meta')
                for meta in meta_tags:
                    name = meta.get_attribute('name') or meta.get_attribute('property')
                    content = meta.get_attribute('content')
                    if name and content:
                        page_data['metadata'][name] = content
            except:
                pass
            
            # Calculate content metrics
            text_content = page_data['content'].get('main_text', '')
            page_data['metrics'] = {
                'word_count': len(text_content.split()),
                'character_count': len(text_content),
                'link_density': page_data['content']['link_count'] / max(len(text_content.split()), 1),
                'has_forms': 'form' in self.driver.page_source.lower(),
                'has_search': 'search' in self.driver.page_source.lower(),
                'has_navigation': 'nav' in self.driver.page_source.lower()
            }
            
            return page_data
            
        except Exception as e:
            logger.error(f"Error scraping {company_name} {category}: {str(e)}")
            return {
                'company': company_name,
                'category': category,
                'url': url,
                'error': str(e),
                'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
            }

    def scrape_company_data(self, company_name: str, categories: list = None, max_pages: int = 3) -> dict:
        """
        Scrape comprehensive data for a single company
        """
        if categories is None:
            categories = ['marketing', 'docs', 'rss', 'social']
        
        company_data = {
            'company_name': company_name,
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'categories': {},
            'summary': {
                'total_pages': 0,
                'total_words': 0,
                'total_links': 0,
                'total_images': 0,
                'successful_categories': 0
            }
        }
        
        # Generate URLs for the company
        url_patterns = self.generate_company_urls(company_name)
        
        for category in categories:
            if category in url_patterns:
                # Find working URL for this category
                working_url = self.find_working_url(url_patterns[category])
                
                if working_url:
                    # Scrape the category
                    category_data = self.scrape_company_website(company_name, category, working_url)
                    company_data['categories'][category] = category_data
                    
                    # Update summary
                    if 'error' not in category_data:
                        company_data['summary']['successful_categories'] += 1
                        company_data['summary']['total_pages'] += 1
                        company_data['summary']['total_words'] += category_data.get('metrics', {}).get('word_count', 0)
                        company_data['summary']['total_links'] += category_data.get('content', {}).get('link_count', 0)
                        company_data['summary']['total_images'] += category_data.get('content', {}).get('image_count', 0)
                    
                    # Add delay to avoid overwhelming servers
                    time.sleep(2)
                else:
                    company_data['categories'][category] = {
                        'company': company_name,
                        'category': category,
                        'error': 'No accessible URLs found',
                        'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
                    }
        
        return company_data

    def batch_scrape_companies(self, companies: list, categories: list = None, max_pages: int = 3) -> dict:
        """
        Batch scrape multiple companies
        """
        batch_results = {
            'batch_scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'companies': {},
            'summary': {
                'total_companies': len(companies),
                'successful_companies': 0,
                'total_pages': 0,
                'total_words': 0,
                'total_links': 0,
                'total_images': 0
            }
        }
        
        for company in companies:
            try:
                logger.info(f"Processing company: {company}")
                company_data = self.scrape_company_data(company, categories, max_pages)
                batch_results['companies'][company] = company_data
                
                # Update batch summary
                if company_data['summary']['successful_categories'] > 0:
                    batch_results['summary']['successful_companies'] += 1
                
                batch_results['summary']['total_pages'] += company_data['summary']['total_pages']
                batch_results['summary']['total_words'] += company_data['summary']['total_words']
                batch_results['summary']['total_links'] += company_data['summary']['total_links']
                batch_results['summary']['total_images'] += company_data['summary']['total_images']
                
                # Add delay between companies
                time.sleep(3)
                
            except Exception as e:
                logger.error(f"Error processing company {company}: {str(e)}")
                batch_results['companies'][company] = {
                    'company_name': company,
                    'error': str(e),
                    'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
                }
        
        return batch_results

    def scrape_by_category(self, category: str, company_limit: int = 10) -> dict:
        """
        Scrape companies from a specific category
        """
        companies_data = self.load_tech_companies()
        
        if category not in companies_data:
            raise ValueError(f"Unknown category: {category}")
        
        companies = companies_data[category][:company_limit]
        logger.info(f"Scraping {len(companies)} companies from {category} category")
        
        return self.batch_scrape_companies(companies, ['marketing', 'docs'])

    def scrape_random_companies(self, count: int = 5, categories: list = None) -> dict:
        """
        Scrape random companies across all categories
        """
        companies_data = self.load_tech_companies()
        
        # Flatten all companies
        all_companies = []
        for category_companies in companies_data.values():
            all_companies.extend(category_companies)
        
        # Select random companies
        selected_companies = random.sample(all_companies, min(count, len(all_companies)))
        logger.info(f"Scraping {len(selected_companies)} random companies")
        
        return self.batch_scrape_companies(selected_companies, categories)

    def export_results(self, data: dict, format: str = 'json', filename: str = None) -> str:
        """
        Export results in specified format
        """
        if filename is None:
            timestamp = time.strftime('%Y%m%d_%H%M%S')
            filename = f'tech_companies_scraping_{timestamp}'
        
        try:
            if format.lower() == 'json':
                filepath = f"{filename}.json"
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            
            elif format.lower() == 'csv':
                filepath = f"{filename}.csv"
                # Flatten data for CSV export
                flattened_data = self._flatten_data_for_csv(data)
                if flattened_data:
                    df = pd.DataFrame(flattened_data)
                    df.to_csv(filepath, index=False, encoding='utf-8')
            
            else:
                raise ValueError(f"Unsupported export format: {format}")
            
            logger.info(f"Results exported successfully to: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Error exporting results: {str(e)}")
            raise

    def _flatten_data_for_csv(self, data: dict) -> list:
        """
        Flatten nested data structure for CSV export
        """
        flattened = []
        
        if 'companies' in data:
            for company_name, company_data in data['companies'].items():
                if 'categories' in company_data:
                    for category_name, category_data in company_data['categories'].items():
                        if 'error' not in category_data:
                            row = {
                                'company': company_name,
                                'category': category_name,
                                'url': category_data.get('url', ''),
                                'title': category_data.get('title', ''),
                                'word_count': category_data.get('metrics', {}).get('word_count', 0),
                                'link_count': category_data.get('content', {}).get('link_count', 0),
                                'image_count': category_data.get('content', {}).get('image_count', 0),
                                'scraped_at': category_data.get('scraped_at', '')
                            }
                            flattened.append(row)
        
        return flattened

    def cleanup(self):
        """
        Clean up resources
        """
        if self.driver:
            self.driver.quit()

def main():
    # Load environment variables
    load_dotenv()
    
    # Initialize scraper
    scraper = TechCompaniesScraper()
    
    try:
        # Example usage scenarios:
        
        # 1. Scrape 5 random companies
        logger.info("Scraping 5 random companies...")
        results = scraper.scrape_random_companies(count=5, categories=['marketing', 'docs'])
        
        # 2. Scrape companies from a specific category
        # logger.info("Scraping enterprise software companies...")
        # results = scraper.scrape_by_category('enterprise_software', company_limit=3)
        
        # 3. Scrape specific companies
        # specific_companies = ['Salesforce', 'HubSpot', 'Slack']
        # results = scraper.batch_scrape_companies(specific_companies, ['marketing', 'docs'])
        
        # Export results
        json_file = scraper.export_results(results, 'json')
        csv_file = scraper.export_results(results, 'csv')
        
        logger.info(f"Scraping complete!")
        logger.info(f"JSON results: {json_file}")
        logger.info(f"CSV results: {csv_file}")
        
        # Print summary
        summary = results.get('summary', {})
        logger.info(f"Summary: {summary['successful_companies']}/{summary['total_companies']} companies processed")
        logger.info(f"Total pages: {summary['total_pages']}")
        logger.info(f"Total words: {summary['total_words']}")
        
    except Exception as e:
        logger.error(f"Error in main execution: {str(e)}")
    
    finally:
        # Clean up
        scraper.cleanup()

if __name__ == "__main__":
    main() 