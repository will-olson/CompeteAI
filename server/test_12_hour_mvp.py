#!/usr/bin/env python3
"""
12-Hour MVP Test Script
Tests the enhanced technical content scraping and AI analysis functionality
"""

import requests
import json
import time
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:3001"
TEST_COMPANY = "OpenAI"
TEST_URLS = {
    "api_docs": "https://platform.openai.com/docs",
    "pricing": "https://openai.com/pricing",
    "features": "https://openai.com/features",
    "integrations": "https://platform.openai.com/docs/integrations"
}

def test_backend_health():
    """Test backend health endpoint"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend healthy: {data['status']}")
            print(f"   Services: {data['services']}")
            return True
        else:
            print(f"❌ Backend unhealthy: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_preset_groups():
    """Test preset groups endpoint"""
    print("\n🔍 Testing preset groups...")
    try:
        response = requests.get(f"{BASE_URL}/api/preset-groups")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Preset groups loaded: {len(data)} groups")
            for key, group in data.items():
                print(f"   - {group['name']}: {group['company_count']} companies")
            return True
        else:
            print(f"❌ Failed to load preset groups: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Preset groups test failed: {e}")
        return False

def test_enhanced_technical_scraping():
    """Test enhanced technical scraping endpoint"""
    print("\n🔍 Testing enhanced technical scraping...")
    try:
        payload = {
            "company": TEST_COMPANY,
            "urls": TEST_URLS
        }
        
        response = requests.post(
            f"{BASE_URL}/api/scrape/technical",
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Technical scraping successful for {data['company']}")
            print(f"   Categories: {data['total_categories']}")
            print(f"   Successful scrapes: {data['successful_scrapes']}")
            
            # Analyze results
            for category, result in data['technical_results'].items():
                if 'error' not in result:
                    quality = result.get('content', {}).get('quality_score', 'N/A')
                    relevance = result.get('technical_relevance', 'N/A')
                    print(f"   - {category}: Quality {quality}/10, Relevance {relevance}")
                else:
                    print(f"   - {category}: Failed - {result['error']}")
            
            return data
        else:
            print(f"❌ Technical scraping failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Technical scraping test failed: {e}")
        return None

def test_technical_content_analysis():
    """Test technical content analysis endpoint"""
    print("\n🔍 Testing technical content analysis...")
    try:
        # Sample technical content for analysis
        sample_content = """
        OpenAI API provides powerful language models for natural language processing tasks.
        The API supports various endpoints including chat completions, text generation,
        and fine-tuning. Authentication is handled via API keys with rate limiting
        and usage-based pricing. The service offers enterprise features like
        dedicated instances and custom model training.
        """
        
        payload = {
            "content": sample_content,
            "company": TEST_COMPANY,
            "category": "api_docs",
            "contentType": "api_docs",
            "industry": "ai-ml",
            "technicalDepth": "intermediate",
            "title": "OpenAI API Documentation",
            "focus_areas": ["api_integration", "authentication", "pricing"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/ai/analyze-technical",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Technical analysis successful")
            print(f"   Company: {data['metadata']['company']}")
            print(f"   Industry: {data['metadata']['industry']}")
            print(f"   Content Type: {data['metadata']['contentType']}")
            
            analysis = data['analysis']
            print(f"   Sentiment: {analysis.get('sentiment_score', 'N/A')}")
            print(f"   Key Topics: {', '.join(analysis.get('key_topics', []))}")
            print(f"   Technical Recommendations: {analysis.get('technical_recommendations', 'N/A')[:100]}...")
            
            return data
        else:
            print(f"❌ Technical analysis failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Technical analysis test failed: {e}")
        return None

def test_technical_quality_metrics():
    """Test technical quality metrics endpoint"""
    print("\n🔍 Testing technical quality metrics...")
    try:
        # Mock scraped data for testing
        mock_data = {
            "companies": {
                "OpenAI": {
                    "categories": {
                        "api_docs": {
                            "items": [
                                {
                                    "title": "API Authentication",
                                    "metadata": {
                                        "quality_score": 8.5,
                                        "technical_relevance": 0.9,
                                        "key_topics": ["authentication", "api_keys", "security"]
                                    }
                                },
                                {
                                    "title": "Rate Limiting",
                                    "metadata": {
                                        "quality_score": 7.8,
                                        "technical_relevance": 0.8,
                                        "key_topics": ["rate_limiting", "quotas", "usage"]
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
        
        payload = {"data": mock_data}
        
        response = requests.post(
            f"{BASE_URL}/api/analytics/technical-quality",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Quality metrics calculated successfully")
            print(f"   Total Items: {data['overview']['total_items']}")
            print(f"   High Quality Items: {data['overview']['high_quality_items']}")
            print(f"   Average Quality: {data['overview']['average_quality_score']}/10")
            print(f"   Technical Relevance: {data['overview']['technical_relevance_score']}")
            
            return data
        else:
            print(f"❌ Quality metrics failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Quality metrics test failed: {e}")
        return None

def run_performance_test():
    """Run basic performance test"""
    print("\n🔍 Running performance test...")
    start_time = time.time()
    
    # Test multiple endpoints
    test_results = []
    
    # Health check
    health_start = time.time()
    health_success = test_backend_health()
    health_time = time.time() - health_start
    test_results.append(("Health Check", health_success, health_time))
    
    # Preset groups
    preset_start = time.time()
    preset_success = test_preset_groups()
    preset_time = time.time() - preset_start
    test_results.append(("Preset Groups", preset_success, preset_time))
    
    # Technical scraping
    scraping_start = time.time()
    scraping_result = test_enhanced_technical_scraping()
    scraping_time = time.time() - scraping_start
    test_results.append(("Technical Scraping", scraping_result is not None, scraping_time))
    
    # Technical analysis
    analysis_start = time.time()
    analysis_result = test_technical_content_analysis()
    analysis_time = time.time() - analysis_start
    test_results.append(("Technical Analysis", analysis_result is not None, analysis_time))
    
    # Quality metrics
    metrics_start = time.time()
    metrics_result = test_technical_quality_metrics()
    metrics_time = time.time() - metrics_start
    test_results.append(("Quality Metrics", metrics_result is not None, metrics_time))
    
    total_time = time.time() - start_time
    
    # Performance summary
    print(f"\n📊 Performance Test Results")
    print(f"{'='*50}")
    print(f"{'Test':<20} {'Status':<10} {'Time':<10}")
    print(f"{'='*50}")
    
    for test_name, success, test_time in test_results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name:<20} {status:<10} {test_time:.2f}s")
    
    print(f"{'='*50}")
    print(f"{'Total Time':<20} {'':<10} {total_time:.2f}s")
    
    # Success rate
    passed_tests = sum(1 for _, success, _ in test_results if success)
    total_tests = len(test_results)
    success_rate = (passed_tests / total_tests) * 100
    
    print(f"\n🎯 Success Rate: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
    
    if success_rate >= 80:
        print("🎉 12-Hour MVP is working well!")
    elif success_rate >= 60:
        print("⚠️  MVP has some issues but core functionality works")
    else:
        print("❌ MVP has significant issues that need attention")

def main():
    """Main test function"""
    print("🚀 StockMarketAI - 12-Hour MVP Test Suite")
    print(f"📅 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Testing backend at: {BASE_URL}")
    print("="*60)
    
    try:
        run_performance_test()
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n💥 Test suite failed: {e}")
    
    print(f"\n📅 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
