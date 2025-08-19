#!/usr/bin/env python3
"""
MVP Scraping Validation Script

This script quickly tests the dynamic bulk scraper to validate that
relevant competitive intelligence data can be captured from third-party sources.
"""

import sys
import os
import time
from datetime import datetime

# Add the server directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dynamic_bulk_scraper import DynamicBulkScraper
from competitive_intelligence_db import CompetitiveIntelligenceDB

def test_basic_scraping():
    """Test basic scraping functionality"""
    print("🧪 Testing Basic Scraping Functionality")
    print("=" * 50)
    
    try:
        # Initialize scraper
        scraper = DynamicBulkScraper()
        print("✅ DynamicBulkScraper initialized successfully")
        
        # Test with a simple company and dimension
        test_company = "Snowflake"
        test_dimension = "spreadsheet_interface"
        
        print(f"\n🔍 Testing scraping for {test_company} - {test_dimension}")
        print("This may take a few minutes...")
        
        start_time = time.time()
        results = scraper.scrape_company_dimension(test_company, test_dimension)
        end_time = time.time()
        
        print(f"✅ Scraping completed in {end_time - start_time:.2f} seconds")
        print(f"📊 Found {len(results)} relevant results")
        
        # Display sample results
        if results:
            print("\n📋 Sample Results:")
            for i, result in enumerate(results[:3]):
                print(f"\n--- Result {i+1} ---")
                print(f"Source: {result.get('source_type', 'unknown')}")
                print(f"Content: {result.get('content', '')[:200]}...")
                print(f"Relevance Score: {result.get('relevance_score', 0):.2f}")
                print(f"Confidence: {result.get('confidence_score', 0):.2f}")
                print(f"Sentiment: {result.get('sentiment', 'unknown')}")
        else:
            print("⚠️  No results found - this might indicate an issue")
            
        return len(results) > 0
        
    except Exception as e:
        print(f"❌ Error during basic scraping test: {e}")
        return False

def test_database_integration():
    """Test database integration"""
    print("\n🗄️  Testing Database Integration")
    print("=" * 50)
    
    try:
        # Initialize database
        db = CompetitiveIntelligenceDB("test_mvp.db")
        print("✅ Database initialized successfully")
        
        # Test inserting a company
        company_id = db.insert_company("Test Company", "https://test.com", "A test company")
        print(f"✅ Company inserted with ID: {company_id}")
        
        # Test getting dimensions
        dimensions = db.get_all_dimensions()
        print(f"✅ Found {len(dimensions)} dimensions")
        
        # Test getting companies
        companies = db.get_all_companies()
        print(f"✅ Found {len(companies)} companies")
        
        # Clean up test database
        os.remove("test_mvp.db")
        print("✅ Test database cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during database test: {e}")
        return False

def test_content_analysis():
    """Test content analysis functionality"""
    print("\n🧠 Testing Content Analysis")
    print("=" * 50)
    
    try:
        from dynamic_bulk_scraper import ContentAnalyzer
        
        analyzer = ContentAnalyzer()
        print("✅ ContentAnalyzer initialized successfully")
        
        # Test content relevance analysis
        test_content = "Snowflake provides excellent spreadsheet-like interface with advanced data modeling capabilities"
        test_dimension = "spreadsheet_interface"
        
        relevance = analyzer.analyze_content_relevance(test_content, test_dimension)
        print(f"✅ Content relevance analysis: {relevance}")
        
        # Test sentiment analysis
        sentiment = analyzer.extract_sentiment(test_content)
        print(f"✅ Sentiment analysis: {sentiment}")
        
        # Test rating extraction
        rating = analyzer.extract_rating("This product gets 4.5 stars out of 5")
        print(f"✅ Rating extraction: {rating}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during content analysis test: {e}")
        return False

def test_hybrid_scraper():
    """Test hybrid scraper functionality"""
    print("\n🔗 Testing Hybrid Scraper")
    print("=" * 50)
    
    try:
        from hybrid_competitive_scraper import HybridCompetitiveScraper
        
        scraper = HybridCompetitiveScraper("test_hybrid.db")
        print("✅ HybridCompetitiveScraper initialized successfully")
        
        # Test getting scraping status
        status = scraper.get_scraping_status()
        print(f"✅ Scraping status: {status}")
        
        # Clean up test database
        os.remove("test_hybrid.db")
        print("✅ Test database cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during hybrid scraper test: {e}")
        return False

def run_quick_validation():
    """Run quick validation of all components"""
    print("🚀 MVP Scraping Validation")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Basic Scraping", test_basic_scraping),
        ("Database Integration", test_database_integration),
        ("Content Analysis", test_content_analysis),
        ("Hybrid Scraper", test_hybrid_scraper),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
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
        print("🎉 All tests passed! MVP scraping is ready for validation.")
    else:
        print("⚠️  Some tests failed. Review the output above for issues.")
    
    return passed == total

if __name__ == "__main__":
    success = run_quick_validation()
    sys.exit(0 if success else 1)
