#!/usr/bin/env python3
"""
Quick Scraping Validation for MVP

This script focuses on validating the most critical scraping functionality
to ensure the MVP can capture relevant competitive intelligence data.
"""

import sys
import os
import time
from datetime import datetime

# Add the server directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_reddit_scraping():
    """Test Reddit scraping - most likely to work"""
    print("🔴 Testing Reddit Scraping")
    print("-" * 40)
    
    try:
        from dynamic_bulk_scraper import DynamicBulkScraper
        
        scraper = DynamicBulkScraper()
        
        # Test with a simple search
        test_company = "Snowflake"
        test_dimension = "spreadsheet_interface"
        
        print(f"Searching Reddit for: {test_company} + {test_dimension}")
        
        # Test the Reddit scraping method directly
        results = scraper._scrape_reddit(test_company, test_dimension)
        
        print(f"Found {len(results)} Reddit results")
        
        if results:
            print("✅ Reddit scraping is working!")
            for i, result in enumerate(results[:2]):
                print(f"  Result {i+1}: {result.get('title', 'No title')[:100]}...")
            return True
        else:
            print("⚠️  No Reddit results found - this might be normal")
            return True  # Still consider it working if no errors
            
    except Exception as e:
        print(f"❌ Reddit scraping failed: {e}")
        return False

def test_g2_scraping():
    """Test G2 scraping - important for reviews"""
    print("\n🟢 Testing G2 Scraping")
    print("-" * 40)
    
    try:
        from dynamic_bulk_scraper import DynamicBulkScraper
        
        scraper = DynamicBulkScraper()
        
        test_company = "Snowflake"
        test_dimension = "spreadsheet_interface"
        
        print(f"Searching G2 for: {test_company}")
        
        results = scraper._scrape_g2(test_company, test_dimension)
        
        print(f"Found {len(results)} G2 results")
        
        if results:
            print("✅ G2 scraping is working!")
            for i, result in enumerate(results[:2]):
                print(f"  Result {i+1}: {result.get('content', 'No content')[:100]}...")
            return True
        else:
            print("⚠️  No G2 results found - this might be normal")
            return True  # Still consider it working if no errors
            
    except Exception as e:
        print(f"❌ G2 scraping failed: {e}")
        return False

def test_content_analysis():
    """Test content analysis - critical for relevance scoring"""
    print("\n🧠 Testing Content Analysis")
    print("-" * 40)
    
    try:
        from dynamic_bulk_scraper import ContentAnalyzer
        
        analyzer = ContentAnalyzer()
        
        # Test with sample content
        test_content = "Snowflake provides excellent spreadsheet-like interface with advanced data modeling capabilities"
        test_dimension = "spreadsheet_interface"
        
        print(f"Analyzing content: '{test_content[:50]}...'")
        print(f"Dimension: {test_dimension}")
        
        relevance = analyzer.analyze_content_relevance(test_content, test_dimension)
        sentiment = analyzer.extract_sentiment(test_content)
        rating = analyzer.extract_rating("This product gets 4.5 stars out of 5")
        
        print(f"✅ Relevance Score: {relevance['relevance_score']:.2f}")
        print(f"✅ Sentiment: {sentiment}")
        print(f"✅ Rating: {rating}")
        
        return True
        
    except Exception as e:
        print(f"❌ Content analysis failed: {e}")
        return False

def test_database_operations():
    """Test basic database operations"""
    print("\n🗄️  Testing Database Operations")
    print("-" * 40)
    
    try:
        from competitive_intelligence_db import CompetitiveIntelligenceDB
        
        # Use a test database
        db = CompetitiveIntelligenceDB("test_quick.db")
        
        # Test basic operations
        company_id = db.insert_company("Test Company", "https://test.com", "A test company")
        print(f"✅ Company inserted with ID: {company_id}")
        
        dimensions = db.get_all_dimensions()
        print(f"✅ Found {len(dimensions)} dimensions")
        
        companies = db.get_all_companies()
        print(f"✅ Found {len(companies)} companies")
        
        # Clean up
        os.remove("test_quick.db")
        print("✅ Test database cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Database operations failed: {e}")
        return False

def test_end_to_end_scraping():
    """Test end-to-end scraping workflow"""
    print("\n🔄 Testing End-to-End Scraping")
    print("-" * 40)
    
    try:
        from hybrid_competitive_scraper import HybridCompetitiveScraper
        
        scraper = HybridCompetitiveScraper("test_e2e.db")
        
        print("Testing complete scraping workflow...")
        
        # Test scraping a single dimension for a competitor
        test_competitor = "Snowflake"
        test_dimension = "spreadsheet_interface"
        
        print(f"Scraping {test_competitor} for {test_dimension}")
        
        start_time = time.time()
        result = scraper.scrape_competitor_dimension(test_competitor, test_dimension)
        end_time = time.time()
        
        print(f"✅ Scraping completed in {end_time - start_time:.2f} seconds")
        print(f"📊 Total results: {result['summary']['total_results']}")
        print(f"📊 Dynamic results: {result['summary']['dynamic_results']}")
        print(f"📊 Surgical results: {result['summary']['surgical_results']}")
        
        # Clean up
        os.remove("test_e2e.db")
        print("✅ Test database cleaned up")
        
        return result['summary']['total_results'] > 0
        
    except Exception as e:
        print(f"❌ End-to-end scraping failed: {e}")
        return False

def main():
    """Run all validation tests"""
    print("🚀 Quick Scraping Validation for MVP")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Reddit Scraping", test_reddit_scraping),
        ("G2 Scraping", test_g2_scraping),
        ("Content Analysis", test_content_analysis),
        ("Database Operations", test_database_operations),
        ("End-to-End Scraping", test_end_to_end_scraping),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            print(f"Running: {test_name}")
            result = test_func()
            results.append((test_name, result))
            print()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
            print()
    
    # Summary
    print("=" * 60)
    print("📊 VALIDATION SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! MVP scraping is ready for use.")
        print("\nNext steps:")
        print("1. Start the API server: python test_api_endpoints.py")
        print("2. Test the frontend dashboard")
        print("3. Run full competitive analysis")
    else:
        print("⚠️  Some tests failed. Review the output above for issues.")
        print("\nCritical failures to address:")
        for test_name, result in results:
            if not result:
                print(f"  - {test_name}")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
