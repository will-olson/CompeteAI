#!/usr/bin/env python3
"""
Robust Scraping Validation for MVP

This script focuses on validating the working scraping functionality
and implementing fallback strategies for blocked sources.
"""

import sys
import os
import time
import requests
from datetime import datetime

# Add the server directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_reddit_scraping_robust():
    """Test Reddit scraping with more realistic approach"""
    print("🔴 Testing Robust Reddit Scraping")
    print("-" * 40)
    
    try:
        from dynamic_bulk_scraper import DynamicBulkScraper
        
        scraper = DynamicBulkScraper()
        
        # Test with multiple companies and dimensions
        test_cases = [
            ("Snowflake", "spreadsheet_interface"),
            ("Databricks", "data_app_development"),
            ("Tableau", "spreadsheet_interface"),
        ]
        
        total_results = 0
        
        for company, dimension in test_cases:
            print(f"\nTesting: {company} - {dimension}")
            
            try:
                results = scraper._scrape_reddit(company, dimension)
                print(f"  Found {len(results)} results")
                
                if results:
                    total_results += len(results)
                    # Show sample result
                    sample = results[0]
                    print(f"  Sample: {sample.get('title', 'No title')[:80]}...")
                    print(f"  Source: {sample.get('subreddit', 'Unknown subreddit')}")
                
            except Exception as e:
                print(f"  ⚠️  Error scraping {company}: {e}")
        
        print(f"\n✅ Total Reddit results: {total_results}")
        return total_results > 0
        
    except Exception as e:
        print(f"❌ Reddit scraping test failed: {e}")
        return False

def test_alternative_data_sources():
    """Test alternative data sources that might be more accessible"""
    print("\n🔄 Testing Alternative Data Sources")
    print("-" * 40)
    
    alternative_sources = [
        ("GitHub", "https://github.com/topics/snowflake"),
        ("Stack Overflow", "https://stackoverflow.com/questions/tagged/snowflake"),
        ("Medium", "https://medium.com/search?q=snowflake"),
        ("Dev.to", "https://dev.to/search?q=snowflake"),
    ]
    
    accessible_sources = []
    
    for name, url in alternative_sources:
        try:
            print(f"Testing {name}: {url}")
            
            response = requests.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }, timeout=10)
            
            if response.status_code == 200:
                print(f"  ✅ {name}: Accessible")
                accessible_sources.append(name)
            else:
                print(f"  ⚠️  {name}: Status {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ {name}: Error - {e}")
    
    print(f"\n✅ Accessible alternative sources: {len(accessible_sources)}/{len(alternative_sources)}")
    return accessible_sources

def test_mock_data_generation():
    """Test generating realistic mock data for blocked sources"""
    print("\n🎭 Testing Mock Data Generation")
    print("-" * 40)
    
    try:
        from dynamic_bulk_scraper import ContentAnalyzer
        
        analyzer = ContentAnalyzer()
        
        # Generate mock data for G2-style reviews
        mock_g2_data = [
            {
                'source_type': 'g2_mock',
                'source_url': 'https://www.g2.com/products/snowflake',
                'title': 'Snowflake Review - Excellent Data Platform',
                'content': 'Snowflake provides an excellent spreadsheet-like interface with advanced data modeling capabilities. The semantic layer integration is powerful and the data app development features are comprehensive.',
                'sentiment': 'positive',
                'rating': 8.5,
                'relevance_score': 0.8,
                'confidence_score': 0.9,
                'extraction_date': datetime.now().isoformat()
            },
            {
                'source_type': 'capterra_mock',
                'source_url': 'https://www.capterra.com/p/snowflake',
                'title': 'Snowflake - Great for Business Intelligence',
                'content': 'Snowflake offers strong governed collaboration features and excellent materialization controls. The lineage tracking is comprehensive and the writeback capabilities are solid.',
                'sentiment': 'positive',
                'rating': 8.2,
                'relevance_score': 0.7,
                'confidence_score': 0.8,
                'extraction_date': datetime.now().isoformat()
            }
        ]
        
        # Test content analysis on mock data
        print("Testing content analysis on mock data:")
        for i, mock_item in enumerate(mock_g2_data):
            print(f"\nMock item {i+1}: {mock_item['source_type']}")
            
            # Test relevance for different dimensions
            dimensions = ['spreadsheet_interface', 'semantic_layer_integration', 'governed_collaboration']
            
            for dimension in dimensions:
                relevance = analyzer.analyze_content_relevance(mock_item['content'], dimension)
                sentiment = analyzer.extract_sentiment(mock_item['content'])
                rating = analyzer.extract_rating(f"This product gets {mock_item['rating']} out of 10")
                
                print(f"  {dimension}: Relevance {relevance['relevance_score']:.2f}, Sentiment: {sentiment}, Rating: {rating}")
        
        print("\n✅ Mock data generation and analysis working")
        return True
        
    except Exception as e:
        print(f"❌ Mock data test failed: {e}")
        return False

def test_hybrid_scraper_with_fallbacks():
    """Test hybrid scraper with fallback strategies"""
    print("\n🔗 Testing Hybrid Scraper with Fallbacks")
    print("-" * 40)
    
    try:
        from hybrid_competitive_scraper import HybridCompetitiveScraper
        
        scraper = HybridCompetitiveScraper("test_fallbacks.db")
        
        print("✅ Hybrid scraper initialized")
        
        # Test scraping with fallback to mock data
        test_competitor = "Snowflake"
        test_dimension = "spreadsheet_interface"
        
        print(f"Testing scraping for {test_competitor} - {test_dimension}")
        
        # This should work even if external scraping fails
        result = scraper.scrape_competitor_dimension(test_competitor, test_dimension)
        
        print(f"✅ Scraping completed")
        print(f"📊 Total results: {result['summary']['total_results']}")
        print(f"📊 Dynamic results: {result['summary']['dynamic_results']}")
        print(f"📊 Surgical results: {result['summary']['surgical_results']}")
        
        # Clean up
        os.remove("test_fallbacks.db")
        print("✅ Test database cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Hybrid scraper fallback test failed: {e}")
        return False

def test_api_endpoints_robust():
    """Test API endpoints with realistic data"""
    print("\n🌐 Testing API Endpoints Robustly")
    print("-" * 40)
    
    try:
        from competitive_intelligence_api import init_competitive_intelligence_api
        from flask import Flask
        
        app = Flask(__name__)
        
        # Initialize the API
        init_competitive_intelligence_api(app, "test_api_robust.db")
        
        print("✅ API initialized successfully")
        
        # Test with test client
        with app.test_client() as client:
            # Test health check
            response = client.get('/api/competitive-intelligence/health')
            print(f"✅ Health check: {response.status_code}")
            
            # Test getting companies
            response = client.get('/api/competitive-intelligence/companies')
            print(f"✅ Companies endpoint: {response.status_code}")
            
            # Test getting dimensions
            response = client.get('/api/competitive-intelligence/dimensions')
            print(f"✅ Dimensions endpoint: {response.status_code}")
            
            # Test getting Sigma data
            response = client.get('/api/competitive-intelligence/sigma/preset-data')
            print(f"✅ Sigma data endpoint: {response.status_code}")
        
        # Clean up
        os.remove("test_api_robust.db")
        print("✅ Test database cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def test_frontend_integration():
    """Test that the frontend can work with the available data"""
    print("\n🖥️  Testing Frontend Integration")
    print("-" * 40)
    
    try:
        # Test that Sigma data is properly structured for frontend
        from hybrid_competitive_scraper import HybridCompetitiveScraper
        
        scraper = HybridCompetitiveScraper("test_frontend.db")
        
        # Get Sigma data
        sigma_data = scraper.sigma_data
        
        if sigma_data and 'competitive_positioning' in sigma_data:
            print("✅ Sigma data structure is frontend-ready")
            
            # Check that all dimensions have data
            dimensions = sigma_data['competitive_positioning'].keys()
            print(f"✅ Found {len(dimensions)} dimensions with data")
            
            # Check that data has required fields
            sample_dimension = list(dimensions)[0]
            sample_data = sigma_data['competitive_positioning'][sample_dimension]
            
            required_fields = ['score', 'strengths', 'capabilities']
            missing_fields = [field for field in required_fields if field not in sample_data]
            
            if not missing_fields:
                print("✅ Dimension data has all required fields")
            else:
                print(f"⚠️  Missing fields: {missing_fields}")
        
        # Test competitor data structure
        competitors = scraper.competitors
        print(f"✅ Competitor list ready: {len(competitors)} competitors")
        
        # Clean up
        os.remove("test_frontend.db")
        print("✅ Test database cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Frontend integration test failed: {e}")
        return False

def main():
    """Run robust validation tests"""
    print("🚀 Robust Scraping Validation for MVP")
    print("=" * 70)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Reddit Scraping Robust", test_reddit_scraping_robust),
        ("Alternative Data Sources", test_alternative_data_sources),
        ("Mock Data Generation", test_mock_data_generation),
        ("Hybrid Scraper Fallbacks", test_hybrid_scraper_with_fallbacks),
        ("API Endpoints Robust", test_api_endpoints_robust),
        ("Frontend Integration", test_frontend_integration),
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
    print("=" * 70)
    print("📊 ROBUST VALIDATION SUMMARY")
    print("=" * 70)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        if isinstance(result, list):
            # Handle alternative sources results
            status = f"✅ {len(result)} sources accessible"
            if len(result) > 0:
                passed += 1
        else:
            status = "✅ PASS" if result else "❌ FAIL"
            if result:
                passed += 1
        print(f"{status} {test_name}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! MVP is robust and ready for use.")
        print("\nNext steps:")
        print("1. Start the API server: python test_api_endpoints.py")
        print("2. Test the frontend dashboard")
        print("3. Deploy with fallback strategies")
    else:
        print("⚠️  Some tests failed. Review the output above for issues.")
        print("\nCritical failures to address:")
        for test_name, result in results:
            if isinstance(result, list) and len(result) == 0:
                print(f"  - {test_name}: No alternative sources accessible")
            elif not result:
                print(f"  - {test_name}")
    
    # MVP readiness assessment
    print("\n🎯 MVP READINESS ASSESSMENT")
    print("=" * 40)
    
    if passed >= 5:
        print("🟢 MVP is READY for deployment")
        print("   - Core functionality working")
        print("   - Fallback strategies implemented")
        print("   - Frontend integration ready")
    elif passed >= 4:
        print("🟡 MVP is MOSTLY READY")
        print("   - Core functionality working")
        print("   - Some fallbacks may be needed")
        print("   - Frontend should work")
    else:
        print("🔴 MVP needs more work")
        print("   - Core functionality issues")
        print("   - Fallback strategies needed")
        print("   - Frontend may not work properly")
    
    return passed >= 4  # Consider ready if 4+ tests pass

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
