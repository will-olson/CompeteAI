#!/usr/bin/env python3
"""
Competitive Intelligence API Endpoints

This module provides Flask API endpoints for the competitive intelligence
dashboard, enabling frontend access to competitive data and scraping controls.
"""

from flask import Flask, jsonify, request, Blueprint
from datetime import datetime
import logging
from typing import Dict, List, Any

from hybrid_competitive_scraper import HybridCompetitiveScraper
from competitive_intelligence_db import CompetitiveIntelligenceDB

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask blueprint
competitive_intelligence_bp = Blueprint('competitive_intelligence', __name__)

# Initialize scraper and database
scraper = None
db = None

def init_competitive_intelligence_api(app: Flask, db_path: str = "competitive_intelligence.db"):
    """Initialize the competitive intelligence API"""
    global scraper, db
    
    try:
        scraper = HybridCompetitiveScraper(db_path)
        db = CompetitiveIntelligenceDB(db_path)
        
        # Register blueprint
        app.register_blueprint(competitive_intelligence_bp, url_prefix='/api/competitive-intelligence')
        
        logger.info("Competitive Intelligence API initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing Competitive Intelligence API: {e}")
        raise

@competitive_intelligence_bp.route('/status', methods=['GET'])
def get_scraping_status():
    """Get overall scraping status and statistics"""
    try:
        if not scraper:
            return jsonify({
                'success': False,
                'error': 'Scraper not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        status = scraper.get_scraping_status()
        
        return jsonify({
            'success': True,
            'data': status,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting scraping status: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/companies', methods=['GET'])
def get_all_companies():
    """Get all companies in the database"""
    try:
        if not db:
            return jsonify({
                'success': False,
                'error': 'Database not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        companies = db.get_all_companies()
        
        return jsonify({
            'success': True,
            'data': companies,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting companies: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/dimensions', methods=['GET'])
def get_all_dimensions():
    """Get all strategic dimensions"""
    try:
        if not db:
            return jsonify({
                'success': False,
                'error': 'Database not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        dimensions = db.get_all_dimensions()
        
        return jsonify({
            'success': True,
            'data': dimensions,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting dimensions: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/company/<company_name>', methods=['GET'])
def get_company_overview(company_name: str):
    """Get comprehensive overview for a specific company"""
    try:
        if not db:
            return jsonify({
                'success': False,
                'error': 'Database not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        company_data = db.get_company_overview(company_name)
        
        if not company_data:
            return jsonify({
                'success': False,
                'error': f'Company {company_name} not found',
                'timestamp': datetime.now().isoformat()
            }), 404
        
        return jsonify({
            'success': True,
            'data': company_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting company overview for {company_name}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/company/<company_name>/dimension/<dimension>', methods=['GET'])
def get_company_dimension_data(company_name: str, dimension: str):
    """Get competitive intelligence data for a specific company and dimension"""
    try:
        if not db:
            return jsonify({
                'success': False,
                'error': 'Database not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        intelligence_data = db.get_competitive_intelligence(company_name, dimension)
        
        return jsonify({
            'success': True,
            'data': {
                'company': company_name,
                'dimension': dimension,
                'intelligence_data': intelligence_data,
                'total_items': len(intelligence_data)
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting company dimension data for {company_name} - {dimension}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/comparison/sigma-vs-<competitor_name>', methods=['GET'])
def get_sigma_comparison(competitor_name: str):
    """Get competitive comparison between Sigma and a competitor"""
    try:
        if not scraper:
            return jsonify({
                'success': False,
                'error': 'Scraper not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        comparison = scraper.get_competitive_comparison(competitor_name)
        
        if 'error' in comparison:
            return jsonify({
                'success': False,
                'error': comparison['error'],
                'timestamp': datetime.now().isoformat()
            }), 404
        
        return jsonify({
            'success': True,
            'data': comparison,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting Sigma comparison for {competitor_name}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/scrape/company/<company_name>/dimension/<dimension>', methods=['POST'])
def scrape_company_dimension(company_name: str, dimension: str):
    """Scrape competitive intelligence for a specific company and dimension"""
    try:
        if not scraper:
            return jsonify({
                'success': False,
                'error': 'Scraper not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Start scraping
        logger.info(f"Starting scraping for {company_name} - {dimension}")
        result = scraper.scrape_competitor_dimension(company_name, dimension)
        
        return jsonify({
            'success': True,
            'data': result,
            'message': f'Scraping completed for {company_name} - {dimension}',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error scraping {company_name} for {dimension}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/scrape/company/<company_name>/all-dimensions', methods=['POST'])
def scrape_company_all_dimensions(company_name: str):
    """Scrape all dimensions for a specific company"""
    try:
        if not scraper:
            return jsonify({
                'success': False,
                'error': 'Scraper not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Start scraping all dimensions
        logger.info(f"Starting scraping for all dimensions for {company_name}")
        result = scraper.scrape_competitor_all_dimensions(company_name)
        
        return jsonify({
            'success': True,
            'data': result,
            'message': f'Scraping completed for all dimensions for {company_name}',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error scraping all dimensions for {company_name}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/scrape/dimension/<dimension>/all-competitors', methods=['POST'])
def scrape_dimension_all_competitors(dimension: str):
    """Scrape a specific dimension for all competitors"""
    try:
        if not scraper:
            return jsonify({
                'success': False,
                'error': 'Scraper not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Start scraping all competitors for this dimension
        logger.info(f"Starting scraping for {dimension} for all competitors")
        result = scraper.scrape_all_competitors_dimension(dimension)
        
        return jsonify({
            'success': True,
            'data': result,
            'message': f'Scraping completed for {dimension} for all competitors',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error scraping {dimension} for all competitors: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/export/company/<company_name>', methods=['GET'])
def export_company_data(company_name: str):
    """Export company data to JSON format"""
    try:
        if not scraper:
            return jsonify({
                'success': False,
                'error': 'Scraper not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        output_file = scraper.export_competitive_analysis(company_name)
        
        if not output_file:
            return jsonify({
                'success': False,
                'error': f'Failed to export data for {company_name}',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        return jsonify({
            'success': True,
            'data': {
                'company': company_name,
                'export_file': output_file,
                'message': f'Data exported successfully for {company_name}'
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error exporting data for {company_name}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/sigma/preset-data', methods=['GET'])
def get_sigma_preset_data():
    """Get Sigma's preset competitive positioning data"""
    try:
        if not scraper:
            return jsonify({
                'success': False,
                'error': 'Scraper not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Get Sigma's data from database
        sigma_data = db.get_company_overview("Sigma")
        
        if not sigma_data:
            return jsonify({
                'success': False,
                'error': 'Sigma data not found',
                'timestamp': datetime.now().isoformat()
            }), 404
        
        return jsonify({
            'success': True,
            'data': sigma_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting Sigma preset data: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/dashboard/overview', methods=['GET'])
def get_dashboard_overview():
    """Get comprehensive dashboard overview data"""
    try:
        if not scraper or not db:
            return jsonify({
                'success': False,
                'error': 'Services not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Get various overview data
        companies = db.get_all_companies()
        dimensions = db.get_all_dimensions()
        status = scraper.get_scraping_status()
        
        # Get Sigma data
        sigma_data = db.get_company_overview("Sigma")
        
        dashboard_data = {
            'companies': companies,
            'dimensions': dimensions,
            'scraping_status': status,
            'sigma_data': sigma_data,
            'total_companies': len(companies),
            'total_dimensions': len(dimensions)
        }
        
        return jsonify({
            'success': True,
            'data': dashboard_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting dashboard overview: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@competitive_intelligence_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        if not scraper or not db:
            return jsonify({
                'success': False,
                'status': 'unhealthy',
                'error': 'Services not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Basic health checks
        companies = db.get_all_companies()
        dimensions = db.get_all_dimensions()
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'data': {
                'database_connected': True,
                'scraper_initialized': True,
                'companies_count': len(companies),
                'dimensions_count': len(dimensions)
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Error handlers
@competitive_intelligence_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'timestamp': datetime.now().isoformat()
    }), 404

@competitive_intelligence_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'timestamp': datetime.now().isoformat()
    }), 500

def main():
    """Test the API endpoints"""
    from flask import Flask
    
    app = Flask(__name__)
    
    # Initialize the API
    init_competitive_intelligence_api(app, "test_competitive_intelligence.db")
    
    # Test endpoints
    with app.test_client() as client:
        # Test health check
        response = client.get('/api/competitive-intelligence/health')
        print(f"Health check: {response.status_code}")
        print(response.get_json())
        
        # Test getting companies
        response = client.get('/api/competitive-intelligence/companies')
        print(f"Companies: {response.status_code}")
        print(response.get_json())
        
        # Test getting dimensions
        response = client.get('/api/competitive-intelligence/dimensions')
        print(f"Dimensions: {response.status_code}")
        print(response.get_json())
    
    print("API testing completed")

if __name__ == "__main__":
    main()
