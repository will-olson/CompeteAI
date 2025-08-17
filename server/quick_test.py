#!/usr/bin/env python3
import requests
import sys

def main():
    print("🚀 QUICK BACKEND VALIDATION")
    print("=" * 40)
    
    base_url = "http://localhost:5001"
    
    # Test 1: Health (5s timeout)
    print("🔍 Test 1: Health Check")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health: PASSED")
            health_ok = True
        else:
            print(f"❌ Health: FAILED ({response.status_code})")
            health_ok = False
    except Exception as e:
        print(f"❌ Health: FAILED ({type(e).__name__})")
        health_ok = False
    
    # Test 2: Real Data (10s timeout)
    print("\n🔍 Test 2: Real Data API")
    try:
        response = requests.get(f"{base_url}/api/real-competitor-data", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                companies = data['data']
                successful = sum(1 for c in companies.values() if c.get('status') == 'success')
                print(f"✅ Real Data: PASSED ({len(companies)} companies, {successful} successful)")
                data_ok = True
            else:
                print("❌ Real Data: FAILED (invalid response)")
                data_ok = False
        else:
            print(f"❌ Real Data: FAILED ({response.status_code})")
            data_ok = False
    except Exception as e:
        print(f"❌ Real Data: FAILED ({type(e).__name__})")
        data_ok = False
    
    # Quick Decision
    print(f"\n📊 Results: Health={health_ok}, Data={data_ok}")
    
    if health_ok and data_ok:
        print("\n✅ BACKEND VALIDATED - Moving to Phase 2")
        print("🚀 Launch frontend: cd ../client && npm run dev")
        print("�� Test: http://localhost:5173/technical-intelligence")
        return True
    else:
        print("\n⚠️  Backend issues - Quick restart needed")
        print("💡 Try: pkill -f insightforge_app && python3 insightforge_app.py &")
        return False

if __name__ == "__main__":
    main()
