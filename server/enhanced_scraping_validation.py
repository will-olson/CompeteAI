#!/usr/bin/env python3
"""
Enhanced Scraping Validation for MVP

This script provides more realistic testing of the scraping functionality
with better error handling and debugging information.
"""

import sys
import os
import time
import requests
from datetime import datetime

# Add the server directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_website_accessibility():
    """Test if target websites are accessible"""
    print("🌐 Testing Website Accessibility")
    print("-" * 40)
    
    test_urls = [
        ("Reddit", "https://www.reddit.com"),
        ("G2", "https://www.g2.com"),
        ("Capterra", "https://www.capterra.com"),
        ("TrustRadius", "https://www.trustradius.com"),
    ]
    
    results = {}
    
    for name, url in test_urls:
        try:
            print(f"Testing {name}: {url}")
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })
            
            if response.status_code == 200:
                print(f"✅ {name}: Accessible (Status: {response.status_code})")
                print(f"   Content length: {len(response.text)} characters")
                results[name] = True
            else:
                print(f"⚠️  {name}: Status {response.status_code}")
                results[name] = False
                
        except Exception as e:
            print(f"❌ {name}: Error - {e}")
            results[name] = False
    
    return results

def test_reddit_search_functionality():
    """Test Reddit search functionality more thoroughly"""
    print("\n🔴 Testing Reddit Search Functionality")
    print("-" * 40)
    
    try:
        # Test direct Reddit search
        search_url = "https://www.reddit.com/search/?q=snowflake&restrict_sr=1"
        
        print(f"Testing Reddit search: {search_url}")
        
        response = requests.get(search_url, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }, timeout=15)
        
        if response.status_code == 200:
            print(f"✅ Reddit search accessible (Status: {response.status_code})")
            print(f"   Content length: {len(response.text)} characters")
            
            # Check if content contains expected elements
            content = response.text.lower()
            if 'snowflake' in content:
                print("✅ Search results contain 'snowflake'")
            if 'reddit' in content:
                print("✅ Reddit branding present")
            
            # Save sample content for debugging
            with open('reddit_sample.html', 'w', encoding='utf-8') as f:
                f.write(response.text[:5000])  # First 5000 chars
            print("💾 Saved sample content to reddit_sample.html")
            
            return True
        else:
            print(f"❌ Reddit search failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Reddit search error: {e}")
        return False

def test_g2_company_page():
    """Test G2 company page accessibility"""
    print("\n🟢 Testing G2 Company Page")
    print("-" * 40)
    
    try:
        # Test G2 Snowflake page
        company_url = "https://www.g2.com/products/snowflake"
        
        print(f"Testing G2 company page: {company_url}")
        
        response = requests.get(company_url, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }, timeout=15)
        
        if response.status_code == 200:
            print(f"✅ G2 company page accessible (Status: {response.status_code})")
            print(f"   Content length: {len(response.text)} characters")
            
            # Check if content contains expected elements
            content = response.text.lower()
            if 'snowflake' in content:
                print("✅ Company page contains 'snowflake'")
            if 'g2' in content:
                print("✅ G2 branding present")
            
            # Save sample content for debugging
            with open('g2_sample.html', 'w', encoding='utf-8') as f:
                f.write(response.text[:5000])  # First 5000 chars
            print("💾 Saved sample content to g2_sample.html")
            
            return True
        else:
            print(f"❌ G2 company page failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ G2 company page error: {e}")
        return False

def test_content_analysis_with_real_data():
    """Test content analysis with more realistic data"""
    print("\n🧠 Testing Content Analysis with Real Data")
    print("-" * 40)
    
    try:
        from dynamic_bulk_scraper import ContentAnalyzer
        
        analyzer = ContentAnalyzer()
        
        # Test with various content types
        test_cases = [
            {
                'content': 'Snowflake provides excellent spreadsheet-like interface with advanced data modeling capabilities',
                'dimension': 'spreadsheet_interface',
                'expected_relevance': 0.3
            },
            {
                'content': 'The semantic layer integration is powerful and allows business users to define metrics',
                'dimension': 'semantic_layer_integration',
                'expected_relevance': 0.4
            },
            {
                'content': 'Data app development features are limited compared to competitors',
                'dimension': 'data_app_development',
                'expected_relevance': 0.2
            }
        ]
        
        all_passed = True
        
        for i, test_case in enumerate(test_cases):
            print(f"\nTest case {i+1}: {test_case['dimension']}")
            print(f"Content: '{test_case['content'][:50]}...'")
            
            relevance = analyzer.analyze_content_relevance(test_case['content'], test_case['dimension'])
            sentiment = analyzer.extract_sentiment(test_case['content'])
            
            print(f"  Relevance Score: {relevance['relevance_score']:.2f} (expected: {test_case['expected_relevance']})")
            print(f"  Sentiment: {sentiment}")
            print(f"  Keyword Matches: {relevance['keyword_matches']}")
            
            # Check if relevance is reasonable
            if relevance['relevance_score'] > 0:
                print(f"  ✅ Relevance detected")
            else:
                print(f"  ⚠️  Low relevance - might need keyword tuning")
                all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Content analysis test failed: {e}")
        return False

def test_database_with_real_scenario():
    """Test database with a realistic competitive intelligence scenario"""
    print("\n🗄️  Testing Database with Real Scenario")
    print("-" * 40)
    
    try:
        from competitive_intelligence_db import CompetitiveIntelligenceDB
        
        db = CompetitiveIntelligenceDB("test_real.db")
        
        # Test inserting a real competitor
        company_id = db.insert_company("Snowflake", "https://www.snowflake.com", "Cloud data platform")
        print(f"✅ Company inserted: Snowflake (ID: {company_id})")
        
        # Test inserting competitive intelligence data
        test_data = [{
            'source_type': 'reddit',
            'source_url': 'https://reddit.com/r/snowflake',
            'title': 'Snowflake vs Databricks for BI',
            'content': 'Snowflake provides excellent spreadsheet-like interface with advanced data modeling',
            'sentiment': 'positive',
            'rating': 8.5,
            'relevance_score': 0.7,
            'confidence_score': 0.8,
            'extraction_date': datetime.now().isoformat()
        }]
        
        inserted_count = db.insert_competitive_intelligence("Snowflake", "spreadsheet_interface", test_data)
        print(f"✅ Inserted {inserted_count} competitive intelligence records")
        
        # Test retrieving the data
        retrieved_data = db.get_competitive_intelligence("Snowflake", "spreadsheet_interface")
        print(f"✅ Retrieved {len(retrieved_data)} records")
        
        # Test getting company overview
        overview = db.get_company_overview("Snowflake")
        print(f"✅ Company overview: {overview.get('total_intelligence_items', 0)} items")
        
        # Clean up
        os.remove("test_real.db")
        print("✅ Test database cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def test_hybrid_scraper_with_mock_data():
    """Test hybrid scraper with mock data to validate the workflow"""
    print("\n🔗 Testing Hybrid Scraper Workflow")
    print("-" * 40)
    
    try:
        from hybrid_competitive_scraper import HybridCompetitiveScraper
        
        scraper = HybridCompetitiveScraper("test_hybrid_workflow.db")
        
        print("✅ Hybrid scraper initialized")
        
        # Test getting scraping status
        status = scraper.get_scraping_status()
        print(f"✅ Scraping status retrieved: {status.get('total_companies', 0)} companies")
        
        # Test getting Sigma data
        sigma_data = scraper.sigma_data
        if sigma_data:
            print(f"✅ Sigma data loaded: {len(sigma_data.get('competitive_positioning', {}))} dimensions")
        else:
            print("⚠️  Sigma data not loaded")
        
        # Test competitor list
        competitors = scraper.competitors
        print(f"✅ Competitor list loaded: {len(competitors)} competitors")
        
        # Clean up
        os.remove("test_hybrid_workflow.db")
        print("✅ Test database cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Hybrid scraper test failed: {e}")
        return False

def main():
    """Run enhanced validation tests"""
    print("🚀 Enhanced Scraping Validation for MVP")
    print("=" * 70)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Website Accessibility", test_website_accessibility),
        ("Reddit Search", test_reddit_search_functionality),
        ("G2 Company Page", test_g2_company_page),
        ("Content Analysis", test_content_analysis_with_real_data),
        ("Database Real Scenario", test_database_with_real_scenario),
        ("Hybrid Scraper Workflow", test_hybrid_scraper_with_mock_data),
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
    print("📊 ENHANCED VALIDATION SUMMARY")
    print("=" * 70)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        if isinstance(result, dict):
            # Handle website accessibility results
            accessible_sites = sum(1 for site_result in result.values() if site_result)
            total_sites = len(result)
            status = f"✅ {accessible_sites}/{total_sites} sites accessible"
            if accessible_sites == total_sites:
                passed += 1
        else:
            status = "✅ PASS" if result else "❌ FAIL"
            if result:
                passed += 1
        print(f"{status} {test_name}")
    
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
            if isinstance(result, dict):
                accessible_sites = sum(1 for site_result in result.values() if site_result)
                if accessible_sites < len(result):
                    print(f"  - {test_name}: {len(result) - accessible_sites} sites inaccessible")
            elif not result:
                print(f"  - {test_name}")
    
    # Additional recommendations
    print("\n💡 Recommendations:")
    if any('reddit' in str(result).lower() for result in results):
        print("  - Reddit scraping may need updated selectors or API approach")
    if any('g2' in str(result).lower() for result in results):
        print("  - G2 scraping may need updated selectors or different approach")
    print("  - Consider using official APIs where available")
    print("  - Implement fallback scraping strategies")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
