#!/usr/bin/env python3
"""
Test API Connection

Simple script to test if the competitive intelligence API is running
and responding correctly.
"""

import requests
import time
import sys

def test_api_connection():
    """Test basic API connectivity"""
    base_url = "http://localhost:5002"
    
    print("🔌 Testing API Connection")
    print("=" * 40)
    
    # Wait a moment for server to start
    print("Waiting for server to start...")
    time.sleep(3)
    
    endpoints = [
        ("Health Check", "/api/competitive-intelligence/health"),
        ("Companies", "/api/competitive-intelligence/companies"),
        ("Dimensions", "/api/competitive-intelligence/dimensions"),
        ("Sigma Data", "/api/competitive-intelligence/sigma/preset-data"),
        ("Dashboard Overview", "/api/competitive-intelligence/dashboard/overview"),
    ]
    
    all_working = True
    
    for name, endpoint in endpoints:
        try:
            url = base_url + endpoint
            print(f"\nTesting: {name}")
            print(f"URL: {url}")
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                print(f"✅ {name}: Working (Status: {response.status_code})")
                
                # Show response data
                try:
                    data = response.json()
                    if 'success' in data and data['success']:
                        print(f"   Response: Success")
                        if 'data' in data:
                            if isinstance(data['data'], list):
                                print(f"   Items: {len(data['data'])}")
                            elif isinstance(data['data'], dict):
                                print(f"   Keys: {list(data['data'].keys())}")
                    else:
                        print(f"   Response: {data.get('error', 'Unknown error')}")
                except:
                    print(f"   Response: {len(response.text)} characters")
                    
            else:
                print(f"❌ {name}: Failed (Status: {response.status_code})")
                all_working = False
                
        except requests.exceptions.ConnectionError:
            print(f"❌ {name}: Connection failed - server may not be running")
            all_working = False
        except Exception as e:
            print(f"❌ {name}: Error - {e}")
            all_working = False
    
    print("\n" + "=" * 40)
    if all_working:
        print("🎉 All API endpoints are working!")
        print("\nNext steps:")
        print("1. Open your browser to http://localhost:3000/competitive-intelligence")
        print("2. Test the frontend dashboard")
        print("3. Try selecting a competitor and scraping data")
    else:
        print("⚠️  Some API endpoints failed")
        print("\nTroubleshooting:")
        print("1. Check if the server is running: python test_api_endpoints.py")
        print("2. Verify the server is on port 5002")
        print("3. Check for any error messages in the server console")
    
    return all_working

if __name__ == "__main__":
    success = test_api_connection()
    sys.exit(0 if success else 1)
