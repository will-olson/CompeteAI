#!/usr/bin/env python3
"""
Real Data Scraper Validation Script
Tests and validates the quality of scraped competitor data
"""

import json
from real_data_scraper import RealDataCompetitiveScraper

def validate_scraped_content():
    """Validate the quality and relevance of scraped content"""
    
    print("🧪 REAL DATA SCRAPER VALIDATION")
    print("=" * 50)
    
    # Initialize scraper
    scraper = RealDataCompetitiveScraper()
    
    # Test with a few key companies
    test_companies = ['Snowflake', 'Databricks', 'PowerBI']
    
    for company in test_companies:
        print(f"\n🔍 VALIDATING: {company}")
        print("-" * 30)
        
        try:
            # Scrape company data
            company_data = scraper.scrape_competitor(company)
            
            if company_data['status'] == 'success':
                print(f"✅ Status: {company_data['status']}")
                print(f"📊 Total Docs: {company_data['total_docs']}")
                print(f"🌐 Domain: {company_data['domain']}")
                
                # Analyze strategic dimensions
                strategic = company_data['strategic_analysis']
                print(f"\n📈 Strategic Analysis:")
                print(f"  - API-First: {strategic['api_first_architecture']['score']:.1f}")
                print(f"  - Cloud-Native: {strategic['cloud_native_features']['score']:.1f}")
                print(f"  - Data Integration: {strategic['data_integration']['score']:.1f}")
                print(f"  - Developer Experience: {strategic['developer_experience']['score']:.1f}")
                print(f"  - Modern Analytics: {strategic['modern_analytics']['score']:.1f}")
                
                # Examine actual content
                print(f"\n📄 Content Samples:")
                for i, doc in enumerate(company_data['scraped_docs'][:2]):  # Show first 2 docs
                    print(f"  Doc {i+1}:")
                    print(f"    URL: {doc['url']}")
                    content_preview = doc['content'][:200] + "..." if len(doc['content']) > 200 else doc['content']
                    print(f"    Content: {content_preview}")
                    print(f"    Length: {len(doc['content'])} characters")
                    print()
                
            else:
                print(f"❌ Status: {company_data['status']}")
                print(f"🚨 Error: {company_data.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🏁 VALIDATION COMPLETE")

def test_content_relevance():
    """Test content relevance scoring"""
    
    print("\n🎯 CONTENT RELEVANCE TESTING")
    print("=" * 50)
    
    scraper = RealDataCompetitiveScraper()
    
    # Test with a company known to have good content
    company_data = scraper.scrape_competitor('Databricks')
    
    if company_data['status'] == 'success':
        print("✅ Databricks content analysis:")
        
        for doc in company_data['scraped_docs']:
            content = doc['content'].lower()
            
            # Check for technical keywords
            api_keywords = ['api', 'endpoint', 'rest', 'sdk', 'authentication']
            cloud_keywords = ['cloud', 'scaling', 'serverless', 'container']
            data_keywords = ['connector', 'pipeline', 'etl', 'streaming']
            
            api_count = sum(1 for kw in api_keywords if kw in content)
            cloud_count = sum(1 for kw in cloud_keywords if kw in content)
            data_count = sum(1 for kw in data_keywords if kw in content)
            
            print(f"  📄 {doc['url']}")
            print(f"    API Keywords: {api_count}/{len(api_keywords)}")
            print(f"    Cloud Keywords: {cloud_count}/{len(cloud_keywords)}")
            print(f"    Data Keywords: {data_count}/{len(data_keywords)}")
            print(f"    Content Length: {len(content)} characters")
            print()

if __name__ == "__main__":
    validate_scraped_content()
    test_content_relevance()
