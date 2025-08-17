#!/usr/bin/env python3
import requests
import sys

def main():
    print("🧪 QUICK BACKEND VALIDATION")
    print("=" * 40)
    
    base_url = "http://localhost:5001"
    
    # Test 1: Health check
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check: PASSED")
        else:
            print(f"❌ Health check: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Health check: FAILED ({e})")
        return False
    
    # Test 2: Real data endpoint
    print("🔍 Testing real data endpoint...")
    try:
        response = requests.get(f"{base_url}/api/real-competitor-data", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                companies = data['data']
                print(f"✅ Real data endpoint: PASSED ({len(companies)} companies)")
                return True
            else:
                print("❌ Real data endpoint: FAILED (invalid response)")
                return False
        else:
            print(f"❌ Real data endpoint: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Real data endpoint: FAILED ({e})")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🚀 BACKEND VALIDATED - Ready for Phase 2")
    else:
        print("\n⚠️  BACKEND ISSUES - Review required")
    sys.exit(0 if success else 1)
