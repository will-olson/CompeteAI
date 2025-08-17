#!/usr/bin/env python3
import json
import time
from datetime import datetime
from real_data_scraper import RealDataCompetitiveScraper

def main():
    print("🧪 COMPREHENSIVE REAL DATA SCRAPER VALIDATION")
    print("=" * 60)
    print(f"🕐 Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    scraper = RealDataCompetitiveScraper()
    
    # Test 1: Basic Scraping
    print("🔍 TEST 1: Basic Scraping Functionality")
    print("-" * 40)
    
    start_time = time.time()
    results = scraper.scrape_all_competitors()
    end_time = time.time()
    
    total_companies = len(results)
    successful_scrapes = sum(1 for r in results.values() if r.get('status') == 'success')
    failed_scrapes = total_companies - successful_scrapes
    
    print(f"✅ Total Companies: {total_companies}")
    print(f"✅ Successful Scrapes: {successful_scrapes}")
    print(f"❌ Failed Scrapes: {failed_scrapes}")
    print(f"📊 Success Rate: {(successful_scrapes / total_companies) * 100:.1f}%")
    print(f"⏱️  Execution Time: {end_time - start_time:.2f}s")
    
    # Test 2: Content Quality
    print("\n🎯 TEST 2: Content Quality Analysis")
    print("-" * 40)
    
    successful_companies = [k for k, v in results.items() if v.get('status') == 'success']
    for company in successful_companies[:3]:  # Top 3
        data = results[company]
        docs = data.get('scraped_docs', [])
        
        if docs:
            total_length = sum(len(doc.get('content', '')) for doc in docs)
            avg_length = total_length / len(docs)
            
            print(f"�� {company}: {len(docs)} docs, {total_length:,} chars, avg: {avg_length:,.0f} chars")
    
    # Test 3: Strategic Analysis
    print("\n📈 TEST 3: Strategic Analysis Summary")
    print("-" * 40)
    
    for company in successful_companies[:5]:  # Top 5
        data = results[company]
        strategic = data.get('strategic_analysis', {})
        
        api_score = strategic.get('api_first_architecture', {}).get('score', 0)
        cloud_score = strategic.get('cloud_native_features', {}).get('score', 0)
        
        print(f"🏢 {company}: API={api_score:.1f}, Cloud={cloud_score:.1f}")
    
    print(f"\n🕐 Test Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

if __name__ == "__main__":
    main()
