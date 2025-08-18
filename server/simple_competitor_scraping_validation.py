#!/usr/bin/env python3
"""
Simple MVP Competitor Scraping Validation
Tests basic scraping ability across all companies in competitor_targeting.py
Following the three-file architecture pattern from financial pipeline analysis
"""

import requests
import time
import json
from datetime import datetime
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import random

# Import competitor targeting data
from competitor_targeting import COMPETITORS

class SimpleCompetitorScraper:
    """Simple scraper to validate basic data collection ability"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.results = {}
        
    def scrape_company_basic(self, company):
        """Scrape basic information from a company's main domain and docs"""
        company_name = company['name']
        domain = company['domain']
        docs = company.get('docs', [])
        
        print(f"🔍 Testing: {company_name}")
        
        company_result = {
            'name': company_name,
            'domain': domain,
            'main_page_status': 'unknown',
            'main_page_content_length': 0,
            'docs_status': 'unknown',
            'docs_content_length': 0,
            'total_content_length': 0,
            'scraping_success': False,
            'error': None
        }
        
        try:
            # Test main domain
            print(f"  📄 Testing main domain: {domain}")
            response = self.session.get(domain, timeout=10)
            if response.status_code == 200:
                company_result['main_page_status'] = 'success'
                company_result['main_page_content_length'] = len(response.text)
                print(f"    ✅ Main page: {len(response.text)} characters")
            else:
                company_result['main_page_status'] = f'failed_{response.status_code}'
                print(f"    ❌ Main page: HTTP {response.status_code}")
                
        except Exception as e:
            company_result['main_page_status'] = f'error_{type(e).__name__}'
            company_result['error'] = str(e)
            print(f"    ❌ Main page: {type(e).__name__} - {e}")
        
        # Test documentation links
        if docs:
            total_docs_length = 0
            docs_success = 0
            
            for doc_url in docs[:2]:  # Limit to first 2 docs per company
                try:
                    print(f"  📚 Testing docs: {doc_url}")
                    response = self.session.get(doc_url, timeout=10)
                    if response.status_code == 200:
                        docs_success += 1
                        total_docs_length += len(response.text)
                        print(f"    ✅ Docs: {len(response.text)} characters")
                    else:
                        print(f"    ❌ Docs: HTTP {response.status_code}")
                        
                except Exception as e:
                    print(f"    ❌ Docs: {type(e).__name__} - {e}")
            
            if docs_success > 0:
                company_result['docs_status'] = 'partial_success'
                company_result['docs_content_length'] = total_docs_length
            else:
                company_result['docs_status'] = 'failed'
        
        # Calculate total content
        company_result['total_content_length'] = (
            company_result['main_page_content_length'] + 
            company_result['docs_content_length']
        )
        
        # Determine overall success
        company_result['scraping_success'] = (
            company_result['main_page_status'] == 'success' or 
            company_result['docs_status'] == 'partial_success'
        )
        
        self.results[company_name] = company_result
        
        # Add delay to be respectful
        time.sleep(random.uniform(1, 3))
        
        return company_result
    
    def validate_all_competitors(self):
        """Validate scraping ability across all competitors"""
        print("🚀 SIMPLE COMPETITOR SCRAPING VALIDATION")
        print("=" * 60)
        print(f"🕐 Started: {datetime.now().strftime('%H:%M:%S')}")
        print(f"🎯 Total companies: {len(COMPETITORS)}")
        print()
        
        for company in COMPETITORS:
            self.scrape_company_basic(company)
            print()
        
        return self.results
    
    def generate_summary_report(self):
        """Generate a summary report of scraping validation"""
        total_companies = len(self.results)
        successful_scrapes = sum(1 for r in self.results.values() if r['scraping_success'])
        total_content = sum(r['total_content_length'] for r in self.results.values())
        
        print("📊 SCRAPING VALIDATION SUMMARY")
        print("=" * 40)
        print(f"🏢 Total Companies: {total_companies}")
        print(f"✅ Successful Scrapes: {successful_scrapes}")
        print(f"❌ Failed Scrapes: {total_companies - successful_scrapes}")
        print(f"📈 Success Rate: {(successful_scrapes/total_companies)*100:.1f}%")
        print(f"📄 Total Content: {total_content:,} characters")
        print()
        
        # Company breakdown
        print("🏢 COMPANY BREAKDOWN:")
        for company_name, result in self.results.items():
            status_icon = "✅" if result['scraping_success'] else "❌"
            content_length = f"{result['total_content_length']:,}" if result['total_content_length'] > 0 else "0"
            print(f"  {status_icon} {company_name}: {content_length} chars")
        
        return {
            'total_companies': total_companies,
            'successful_scrapes': successful_scrapes,
            'success_rate': (successful_scrapes/total_companies)*100,
            'total_content': total_content,
            'company_results': self.results
        }

def main():
    """Main validation function"""
    scraper = SimpleCompetitorScraper()
    
    # Run validation
    results = scraper.validate_all_competitors()
    
    # Generate summary
    summary = scraper.generate_summary_report()
    
    # Save results to file
    output_file = f"competitor_scraping_validation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w') as f:
        json.dump({
            'validation_summary': summary,
            'detailed_results': results,
            'timestamp': datetime.now().isoformat()
        }, f, indent=2)
    
    print(f"\n💾 Results saved to: {output_file}")
    
    # Recommendations
    print("\n💡 RECOMMENDATIONS:")
    if summary['success_rate'] >= 80:
        print("✅ High success rate - ready for enhanced scraping")
    elif summary['success_rate'] >= 60:
        print("⚠️ Moderate success rate - some companies need attention")
    else:
        print("❌ Low success rate - fundamental issues need resolution")
    
    print(f"\n🕐 Completed: {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    main()
