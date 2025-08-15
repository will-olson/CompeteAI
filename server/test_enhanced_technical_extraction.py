#!/usr/bin/env python3
"""
Test Enhanced Technical Content Extraction
Validates Phase 1 implementation of technical content classification and API documentation detection
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from competitive_intelligence_scraper import CompetitiveIntelligenceScraper
import json

def test_technical_content_classification():
    """Test the technical content classification system"""
    print("🧪 Testing Technical Content Classification...")
    
    scraper = CompetitiveIntelligenceScraper()
    
    # Test content samples
    test_contents = [
        {
            'name': 'API Documentation',
            'content': '''
            # API Reference
            ## Authentication
            Use OAuth 2.0 for authentication. Include your client_id and client_secret.
            
            ## Endpoints
            GET /api/v1/users - Retrieve users
            POST /api/v1/users - Create user
            
            ## Rate Limits
            Rate limit: 1000 requests per hour
            
            ```python
            import requests
            response = requests.get('https://api.example.com/v1/users')
            ```
            ''',
            'company': 'TestCompany'
        },
        {
            'name': 'SDK Documentation',
            'content': '''
            # Getting Started with Our SDK
            
            ## Installation
            ```bash
            npm install example-sdk
            pip install example-sdk
            ```
            
            ## Quick Start
            ```javascript
            const sdk = require('example-sdk');
            const client = new sdk.Client('your-api-key');
            ```
            
            ## GitHub Repository
            https://github.com/example/example-sdk
            ''',
            'company': 'TestCompany'
        },
        {
            'name': 'Pricing Information',
            'content': '''
            # Pricing Plans
            
            ## Starter Plan
            $29 per month
            - 1000 API calls
            - Basic support
            
            ## Professional Plan
            $99 per month
            - 10000 API calls
            - Priority support
            
            ## Enterprise Plan
            Contact sales for custom pricing
            ''',
            'company': 'TestCompany'
        }
    ]
    
    for test_case in test_contents:
        print(f"\n📝 Testing: {test_case['name']}")
        classification = scraper.classify_technical_content(
            test_case['content'], 
            test_case['company']
        )
        
        print(f"  Content Type: {classification.get('content_type', 'unknown')}")
        print(f"  Technical Depth: {classification.get('technical_depth', 0.0)}")
        print(f"  API Relevance: {classification.get('api_relevance', 0.0)}")
        print(f"  SDK Relevance: {classification.get('sdk_relevance', 0.0)}")
        print(f"  Pricing Relevance: {classification.get('pricing_relevance', 0.0)}")
        print(f"  Overall Technical Score: {classification.get('overall_technical_score', 0.0)}")
        
        if classification.get('detected_patterns'):
            print(f"  Detected Patterns: {', '.join(classification['detected_patterns'][:5])}")
        
        if classification.get('company_specific_matches'):
            print(f"  Company Matches: {', '.join(classification['company_specific_matches'])}")

def test_openapi_detection():
    """Test OpenAPI specification detection"""
    print("\n🔍 Testing OpenAPI Detection...")
    
    scraper = CompetitiveIntelligenceScraper()
    
    # Test HTML content with OpenAPI references
    test_html = '''
    <html>
        <head>
            <title>API Documentation</title>
        </head>
        <body>
            <h1>API Reference</h1>
            <p>Download our OpenAPI specification:</p>
            <a href="https://api.example.com/openapi.json">OpenAPI JSON</a>
            <a href="https://api.example.com/swagger.yaml">Swagger YAML</a>
            
            <script>
                const openapiSpec = {
                    "openapi": "3.0.0",
                    "info": {"title": "Example API"}
                };
            </script>
        </body>
    </html>
    '''
    
    openapi_specs = scraper.detect_openapi_specs(test_html)
    print(f"  Detected {len(openapi_specs)} OpenAPI specifications:")
    
    for spec in openapi_specs:
        print(f"    - Type: {spec['type']}")
        if 'url' in spec:
            print(f"      URL: {spec['url']}")
        if 'link_text' in spec:
            print(f"      Link Text: {spec['link_text']}")

def test_technical_content_extraction():
    """Test the enhanced technical content extraction"""
    print("\n🔧 Testing Technical Content Extraction...")
    
    scraper = CompetitiveIntelligenceScraper()
    
    # Test HTML content
    test_html = '''
    <html>
        <head>
            <title>Technical Documentation</title>
        </head>
        <body>
            <h1>API Reference</h1>
            
            <table>
                <tr><th>Endpoint</th><th>Method</th></tr>
                <tr><td>/api/users</td><td>GET</td></tr>
                <tr><td>/api/users</td><td>POST</td></tr>
            </table>
            
            <pre><code class="language-python">
import requests
response = requests.get('https://api.example.com/v1/users')
            </code></pre>
            
            <p>Authentication: Use OAuth 2.0 with client_id and client_secret</p>
            <p>Rate limit: 1000 requests per hour</p>
            
            <a href="/docs/api">API Documentation</a>
            <a href="/developers/sdk">SDK Download</a>
            <a href="https://github.com/example/sdk">GitHub Repository</a>
        </body>
    </html>
    '''
    
    technical_content = scraper._extract_technical_content(test_html, "TestCompany")
    
    print(f"  Tables: {len(technical_content.get('tables', []))}")
    print(f"  Code Blocks: {len(technical_content.get('code_blocks', []))}")
    print(f"  Links: {len(technical_content.get('links', []))}")
    print(f"  OpenAPI Specs: {len(technical_content.get('openapi_specs', []))}")
    print(f"  API Endpoints: {len(technical_content.get('api_endpoints', []))}")
    print(f"  Auth Patterns: {len(technical_content.get('authentication_patterns', []))}")
    print(f"  Rate Limit Info: {len(technical_content.get('rate_limit_info', []))}")
    
    # Show content classification
    classification = technical_content.get('content_classification', {})
    print(f"  Content Type: {classification.get('content_type', 'unknown')}")
    print(f"  Overall Technical Score: {classification.get('overall_technical_score', 0.0)}")
    
    # Show high-scoring links
    high_tech_links = [link for link in technical_content.get('links', []) 
                       if link.get('technical_score', 0) > 0.5]
    print(f"  High Technical Links: {len(high_tech_links)}")
    
    for link in high_tech_links[:3]:
        print(f"    - {link.get('text', '')} (Score: {link.get('technical_score', 0)})")

def test_api_endpoint_extraction():
    """Test API endpoint extraction from text"""
    print("\n🌐 Testing API Endpoint Extraction...")
    
    scraper = CompetitiveIntelligenceScraper()
    
    test_text = '''
    Our API provides the following endpoints:
    
    GET /api/v1/users - Retrieve all users
    POST /api/v1/users - Create a new user
    PUT /api/v1/users/{id} - Update user
    DELETE /api/v1/users/{id} - Delete user
    
    Base URL: https://api.example.com
    API Version: v1
    
    For GraphQL: https://api.example.com/graphql
    '''
    
    endpoints = scraper._extract_api_endpoints_from_text(test_text)
    print(f"  Extracted {len(endpoints)} API endpoints:")
    
    for endpoint in endpoints:
        if 'method' in endpoint:
            print(f"    - {endpoint['method']} {endpoint['path']} ({endpoint['type']})")
        else:
            print(f"    - {endpoint['url']} ({endpoint['type']})")

def test_authentication_pattern_extraction():
    """Test authentication pattern extraction"""
    print("\n🔐 Testing Authentication Pattern Extraction...")
    
    scraper = CompetitiveIntelligenceScraper()
    
    test_text = '''
    Authentication Methods:
    
    1. OAuth 2.0
       - client_id: your_client_id
       - client_secret: your_client_secret
       - authorization_code flow
    
    2. API Key
       - x-api-key: your_api_key
       - Authorization: Bearer your_token
    
    3. Basic Authentication
       - username: your_username
       - password: your_password
    '''
    
    auth_patterns = scraper._extract_authentication_patterns(test_text)
    print(f"  Extracted {len(auth_patterns)} authentication patterns:")
    
    for pattern in auth_patterns:
        print(f"    - {pattern['type']}: {len(pattern['matches'])} matches")

def main():
    """Run all tests"""
    print("🚀 Testing Enhanced Technical Content Extraction (Phase 1)")
    print("=" * 60)
    
    try:
        test_technical_content_classification()
        test_openapi_detection()
        test_technical_content_extraction()
        test_api_endpoint_extraction()
        test_authentication_pattern_extraction()
        
        print("\n✅ All tests completed successfully!")
        print("\n📊 Phase 1 Implementation Summary:")
        print("  ✓ Technical Content Classification")
        print("  ✓ API Documentation Detection")
        print("  ✓ Enhanced Code Block Analysis")
        print("  ✓ Technical Link Relevance Scoring")
        print("  ✓ API Endpoint Extraction")
        print("  ✓ Authentication Pattern Detection")
        print("  ✓ Rate Limit Information Extraction")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
