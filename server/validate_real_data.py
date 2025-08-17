#!/usr/bin/env python3
from real_data_scraper import RealDataCompetitiveScraper

def main():
    print("🧪 REAL DATA SCRAPER VALIDATION")
    print("=" * 50)
    
    scraper = RealDataCompetitiveScraper()
    
    # Test with key companies
    test_companies = ['Snowflake', 'Databricks', 'PowerBI']
    
    for company in test_companies:
        print(f"\n🔍 VALIDATING: {company}")
        print("-" * 30)
        
        try:
            company_data = scraper.scrape_competitor(company)
            
            if company_data['status'] == 'success':
                print(f"✅ Status: {company_data['status']}")
                print(f"📊 Total Docs: {company_data['total_docs']}")
                
                strategic = company_data['strategic_analysis']
                print(f"📈 API Score: {strategic['api_first_architecture']['score']:.1f}")
                print(f"📈 Cloud Score: {strategic['cloud_native_features']['score']:.1f}")
                
                # Show content sample
                if company_data['scraped_docs']:
                    doc = company_data['scraped_docs'][0]
                    content_preview = doc['content'][:150] + "..." if len(doc['content']) > 150 else doc['content']
                    print(f"📄 Content Preview: {content_preview}")
                    print(f"📏 Length: {len(doc['content'])} characters")
            else:
                print(f"❌ Error: {company_data.get('error', 'Unknown')}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
    
    print("\n🏁 VALIDATION COMPLETE")

if __name__ == "__main__":
    main()
