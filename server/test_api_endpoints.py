#!/usr/bin/env python3
"""
Test API Endpoints for Competitive Intelligence

This script creates a minimal Flask app to test the competitive intelligence
API endpoints and validate the scraping functionality.
"""

from flask import Flask, jsonify
import os
import sys

# Add the server directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from competitive_intelligence_api import init_competitive_intelligence_api

app = Flask(__name__)

# Initialize the competitive intelligence API
init_competitive_intelligence_api(app, "test_api.db")

@app.route('/')
def home():
    """Simple home endpoint"""
    return jsonify({
        'message': 'Competitive Intelligence API Test Server',
        'endpoints': {
            'health': '/api/competitive-intelligence/health',
            'status': '/api/competitive-intelligence/status',
            'companies': '/api/competitive-intelligence/companies',
            'dimensions': '/api/competitive-intelligence/dimensions',
            'sigma_data': '/api/competitive-intelligence/sigma/preset-data',
            'dashboard_overview': '/api/competitive-intelligence/dashboard/overview'
        },
        'test_scraping': {
            'scrape_company_dimension': 'POST /api/competitive-intelligence/scrape/company/{company}/dimension/{dimension}',
            'scrape_company_all': 'POST /api/competitive-intelligence/scrape/company/{company}/all-dimensions',
            'scrape_dimension_all': 'POST /api/competitive-intelligence/scrape/dimension/{dimension}/all-competitors'
        }
    })

@app.route('/test-scraping')
def test_scraping():
    """Test endpoint to trigger a simple scraping operation"""
    try:
        from hybrid_competitive_scraper import HybridCompetitiveScraper
        
        # Initialize scraper
        scraper = HybridCompetitiveScraper("test_api.db")
        
        # Test scraping a single dimension for a competitor
        test_competitor = "Snowflake"
        test_dimension = "spreadsheet_interface"
        
        print(f"Testing scraping for {test_competitor} - {test_dimension}")
        
        result = scraper.scrape_competitor_dimension(test_competitor, test_dimension)
        
        return jsonify({
            'success': True,
            'message': f'Test scraping completed for {test_competitor}',
            'result': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Competitive Intelligence API Test Server")
    print("=" * 60)
    print("Available endpoints:")
    print("  - GET  /                                    - API overview")
    print("  - GET  /test-scraping                       - Test scraping")
    print("  - GET  /api/competitive-intelligence/health - Health check")
    print("  - GET  /api/competitive-intelligence/status - Scraping status")
    print("  - GET  /api/competitive-intelligence/companies - All companies")
    print("  - GET  /api/competitive-intelligence/dimensions - All dimensions")
    print("  - GET  /api/competitive-intelligence/sigma/preset-data - Sigma data")
    print("  - GET  /api/competitive-intelligence/dashboard/overview - Dashboard data")
    print("=" * 60)
    print("Server will start on http://localhost:5002")
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        app.run(host='0.0.0.0', port=5002, debug=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
    finally:
        # Clean up test database
        if os.path.exists("test_api.db"):
            os.remove("test_api.db")
            print("🧹 Test database cleaned up")
