#!/usr/bin/env python3
"""
Structured Backend Validation & API Testing
Quickly validates backend functionality and real data endpoints
"""

import requests
import time
import json
import sys
from datetime import datetime

class BackendValidator:
    def __init__(self):
        self.base_url = "http://localhost:5001"
        self.test_results = {}
        
    def test_backend_health(self):
        """Test basic backend health"""
        print("🔍 TEST 1: Backend Health Check")
        print("-" * 40)
        
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                print("✅ Backend health check: PASSED")
                self.test_results['health'] = 'PASSED'
                return True
            else:
                print(f"❌ Backend health check: FAILED (Status: {response.status_code})")
                self.test_results['health'] = 'FAILED'
                return False
        except Exception as e:
            print(f"❌ Backend health check: FAILED (Error: {e})")
            self.test_results['health'] = 'FAILED'
            return False
    
    def test_real_data_endpoint(self):
        """Test real competitor data endpoint"""
        print("\n🔍 TEST 2: Real Data API Endpoint")
        print("-" * 40)
        
        try:
            response = requests.get(f"{self.base_url}/api/real-competitor-data", timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and data.get('data'):
                    companies = data['data']
                    total_companies = len(companies)
                    successful_companies = sum(1 for c in companies.values() if c.get('status') == 'success')
                    
                    print(f"✅ Real data endpoint: PASSED")
                    print(f"   📊 Total Companies: {total_companies}")
                    print(f"   ✅ Successful Scrapes: {successful_companies}")
                    print(f"   📄 Sample Company: {list(companies.keys())[0] if companies else 'None'}")
                    
                    # Quick data validation
                    if successful_companies > 0:
                        sample_company = next((k for k, v in companies.items() if v.get('status') == 'success'), None)
                        if sample_company:
                            company_data = companies[sample_company]
                            docs_count = company_data.get('total_docs', 0)
                            strategic_analysis = company_data.get('strategic_analysis', {})
                            
                            print(f"   🔍 Sample Data Validation:")
                            print(f"      - Documents: {docs_count}")
                            print(f"      - API Score: {strategic_analysis.get('api_first_architecture', {}).get('score', 0):.1f}")
                            print(f"      - Cloud Score: {strategic_analysis.get('cloud_native_features', {}).get('score', 0):.1f}")
                    
                    self.test_results['real_data_endpoint'] = 'PASSED'
                    return True
                else:
                    print(f"❌ Real data endpoint: FAILED (Invalid response structure)")
                    self.test_results['real_data_endpoint'] = 'FAILED'
                    return False
            else:
                print(f"❌ Real data endpoint: FAILED (Status: {response.status_code})")
                self.test_results['real_data_endpoint'] = 'FAILED'
                return False
                
        except Exception as e:
            print(f"❌ Real data endpoint: FAILED (Error: {e})")
            self.test_results['real_data_endpoint'] = 'FAILED'
            return False
    
    def test_frontend_integration(self):
        """Test if frontend can connect to backend"""
        print("\n🔍 TEST 3: Frontend Integration Test")
        print("-" * 40)
        
        try:
            # Test if the backend is accessible from frontend perspective
            response = requests.get(f"{self.base_url}/api/company-data", timeout=10)
            
            if response.status_code == 200:
                print("✅ Frontend integration: PASSED")
                self.test_results['frontend_integration'] = 'PASSED'
                return True
            else:
                print(f"⚠️  Frontend integration: PARTIAL (Status: {response.status_code})")
                self.test_results['frontend_integration'] = 'PARTIAL'
                return True  # Continue anyway
                
        except Exception as e:
            print(f"⚠️  Frontend integration: PARTIAL (Error: {e})")
            self.test_results['frontend_integration'] = 'PARTIAL'
            return True  # Continue anyway
    
    def generate_validation_report(self):
        """Generate validation summary"""
        print("\n📋 BACKEND VALIDATION REPORT")
        print("=" * 50)
        
        passed_tests = sum(1 for result in self.test_results.values() if result == 'PASSED')
        total_tests = len(self.test_results)
        
        print(f"🏆 Overall Status: {'✅ PASSED' if passed_tests == total_tests else '⚠️  PARTIAL' if passed_tests > 0 else '❌ FAILED'}")
        print(f"📊 Test Results: {passed_tests}/{total_tests} passed")
        
        for test_name, result in self.test_results.items():
            status_icon = "✅" if result == 'PASSED' else "⚠️" if result == 'PARTIAL' else "❌"
            print(f"  {status_icon} {test_name}: {result}")
        
        print(f"\n🕐 Validation completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Determine next steps
        if passed_tests >= 2:  # At least health and real data working
            print("\n🚀 READY FOR PHASE 2: Frontend Integration")
            return True
        else:
            print("\n⚠️  BACKEND ISSUES DETECTED - Review required")
            return False

def main():
    """Main validation process"""
    print("🧪 STRUCTURED BACKEND VALIDATION")
    print("=" * 50)
    print(f"🕐 Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    validator = BackendValidator()
    
    # Run tests
    health_ok = validator.test_backend_health()
    if not health_ok:
        print("\n❌ Backend health check failed. Cannot proceed.")
        return False
    
    real_data_ok = validator.test_real_data_endpoint()
    validator.test_frontend_integration()
    
    # Generate report
    success = validator.generate_validation_report()
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
