#!/usr/bin/env python3
"""
Quick Backend Real Data Test
Tests the real data endpoints to ensure they're working before frontend testing
"""

import requests
import json
from datetime import datetime

def test_backend_real_data():
    """Test the backend real data endpoints"""
    print("🧪 TESTING BACKEND REAL DATA ENDPOINTS")
    print("=" * 50)
    print(f"🕐 Started: {datetime.now().strftime('%H:%M:%S')}")
    print()
    
    base_url = "http://localhost:5001"
    
    # Test 1: Health Check
    print("🔍 Test 1: Backend Health")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health: PASSED")
        else:
            print(f"❌ Health: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Health: FAILED ({type(e).__name__})")
        return False
    
    # Test 2: Real Competitor Data
    print("\n🔍 Test 2: Real Competitor Data")
    try:
        response = requests.get(f"{base_url}/api/real-competitor-data", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success') and data.get('data'):
                companies = data['data']
                successful = sum(1 for c in companies.values() if c.get('status') == 'success')
                total = len(companies)
                
                print(f"✅ Real Data: PASSED")
                print(f"   - Total companies: {total}")
                print(f"   - Successful scrapes: {successful}")
                print(f"   - Success rate: {(successful/total)*100:.1f}%")
                
                # Show sample data
                print("\n📊 Sample Company Data:")
                for company_name, company_data in list(companies.items())[:3]:
                    if company_data.get('status') == 'success':
                        docs_count = company_data.get('total_docs', 0)
                        strategic = company_data.get('strategic_analysis', {})
                        api_score = strategic.get('api_first_architecture', {}).get('score', 0)
                        cloud_score = strategic.get('cloud_native_features', {}).get('score', 0)
                        
                        print(f"   - {company_name}: {docs_count} docs, API={api_score}, Cloud={cloud_score}")
                
                return True
            else:
                print("❌ Real Data: FAILED (invalid response structure)")
                return False
        else:
            print(f"❌ Real Data: FAILED ({response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ Real Data: FAILED ({type(e).__name__})")
        return False
    
    # Test 3: Scraped Items
    print("\n🔍 Test 3: Scraped Items")
    try:
        response = requests.get(f"{base_url}/api/scraped-items", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            items_count = len(data) if isinstance(data, list) else 0
            print(f"✅ Scraped Items: PASSED ({items_count} items)")
        else:
            print(f"⚠️ Scraped Items: PARTIAL ({response.status_code})")
            
    except Exception as e:
        print(f"⚠️ Scraped Items: PARTIAL ({type(e).__name__})")
    
    return True

def main():
    """Main test function"""
    print("🎯 BACKEND REAL DATA VALIDATION")
    print("=" * 60)
    
    success = test_backend_real_data()
    
    print("\n📊 TEST RESULTS")
    print("-" * 30)
    
    if success:
        print("✅ BACKEND REAL DATA: VALIDATED")
        print("🚀 Ready for frontend testing!")
        print("\n💡 Next steps:")
        print("   1. Open browser to: http://localhost:8080/technical-intelligence")
        print("   2. Click 'Refresh Data' button")
        print("   3. Verify real data displays in all tabs")
    else:
        print("❌ BACKEND REAL DATA: FAILED")
        print("🔧 Fix backend issues before frontend testing")
    
    print(f"\n🕐 Completed: {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    main()
