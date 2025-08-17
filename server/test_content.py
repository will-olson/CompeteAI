#!/usr/bin/env python3
from real_data_scraper import RealDataCompetitiveScraper

def main():
    print("🎯 CONTENT QUALITY TESTING")
    print("=" * 40)
    
    scraper = RealDataCompetitiveScraper()
    
    # Test PowerBI (known to have API=60.0)
    company = "PowerBI"
    print(f"\n🔍 Testing {company} content quality...")
    
    try:
        data = scraper.scrape_competitor(company)
        
        if data['status'] == 'success':
            docs = data.get('scraped_docs', [])
            print(f"✅ Success: {len(docs)} documents")
            
            for i, doc in enumerate(docs):
                content = doc.get('content', '')
                print(f"\n📄 Document {i+1}:")
                print(f"  URL: {doc['url']}")
                print(f"  Length: {len(content):,} characters")
                
                # Check for technical keywords
                content_lower = content.lower()
                api_terms = ['api', 'endpoint', 'rest', 'sdk']
                cloud_terms = ['cloud', 'azure', 'scaling']
                
                api_found = sum(1 for term in api_terms if term in content_lower)
                cloud_found = sum(1 for term in cloud_terms if term in content_lower)
                
                print(f"  🔌 API Terms: {api_found}/{len(api_terms)}")
                print(f"  ☁️  Cloud Terms: {cloud_found}/{len(cloud_terms)}")
                
                # Content preview
                preview = content[:150].replace('\n', ' ').strip()
                print(f"  📝 Preview: {preview}...")
                
        else:
            print(f"❌ Failed: {data.get('error', 'Unknown')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n🏁 Test complete")

if __name__ == "__main__":
    main()
