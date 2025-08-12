# insightforge_app.py
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import logging
import traceback
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

# Import our custom modules
from competitive_intelligence_scraper import CompetitiveIntelligenceScraper
from ai_competitive_analyzer import AICompetitiveAnalyzer
from enterprise_software_analyzer import EnterpriseSoftwareAnalyzer

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize core components
scraper = CompetitiveIntelligenceScraper()
ai_analyzer = AICompetitiveAnalyzer()
enterprise_analyzer = EnterpriseSoftwareAnalyzer()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'scraper': 'available',
            'ai_analyzer': 'available' if ai_analyzer.preferred_provider else 'limited',
            'enterprise_analyzer': 'available'
        }
    })

# Preset Group Management
@app.route('/api/preset-groups', methods=['GET'])
def get_preset_groups():
    """Get available preset competitor groups"""
    try:
        groups = {}
        for key, group in scraper.preset_groups.items():
            groups[key] = {
                'name': group['name'],
                'description': group['description'],
                'company_count': len(group['companies']),
                'categories': group['categories']
            }
        
        return jsonify(groups)
    
    except Exception as e:
        logger.error(f"Error getting preset groups: {str(e)}")
        return jsonify({
            'error': 'Failed to retrieve preset groups',
            'message': str(e)
        }), 500

@app.route('/api/preset-groups/<group_key>', methods=['GET'])
def load_preset_group(group_key: str):
    """Load a specific preset competitor group"""
    try:
        group = scraper.load_preset_group(group_key)
        return jsonify(group)
    
    except ValueError as e:
        return jsonify({
            'error': 'Group not found',
            'message': str(e)
        }), 404
    
    except Exception as e:
        logger.error(f"Error loading preset group: {str(e)}")
        return jsonify({
            'error': 'Failed to load preset group',
            'message': str(e)
        }), 500

@app.route('/api/custom-groups', methods=['POST'])
def create_custom_group():
    """Create a custom competitor group"""
    try:
        data = request.json
        required_fields = ['name', 'companies', 'categories']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        custom_group = scraper.create_custom_group(
            name=data['name'],
            companies=data['companies'],
            categories=data['categories'],
            description=data.get('description', '')
        )
        
        return jsonify(custom_group), 201
    
    except Exception as e:
        logger.error(f"Error creating custom group: {str(e)}")
        return jsonify({
            'error': 'Failed to create custom group',
            'message': str(e)
        }), 500

# Data Collection & Scraping
@app.route('/api/scrape/company', methods=['POST'])
def scrape_company():
    """Scrape data for a single company"""
    try:
        data = request.json
        required_fields = ['company', 'urls', 'categories']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        page_limit = data.get('page_limit', 10)
        
        company_data = scraper.scrape_company_data(
            company=data['company'],
            urls=data['urls'],
            categories=data['categories'],
            page_limit=page_limit
        )
        
        return jsonify(company_data)
    
    except Exception as e:
        logger.error(f"Error scraping company: {str(e)}")
        return jsonify({
            'error': 'Failed to scrape company data',
            'message': str(e)
        }), 500

@app.route('/api/scrape/group', methods=['POST'])
def scrape_group():
    """Scrape data for an entire competitor group"""
    try:
        data = request.json
        required_fields = ['group']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        page_limit = data.get('page_limit', 10)
        
        group_results = scraper.batch_scrape_group(data['group'], page_limit)
        
        return jsonify(group_results)
    
    except Exception as e:
        logger.error(f"Error scraping group: {str(e)}")
        return jsonify({
            'error': 'Failed to scrape group data',
            'message': str(e)
        }), 500

@app.route('/api/scrape/mass', methods=['POST'])
def mass_scrape():
    """Scrape all preset groups simultaneously"""
    try:
        data = request.json
        page_limit = data.get('page_limit', 10)
        
        all_results = scraper.mass_scrape_all_groups(page_limit)
        
        return jsonify(all_results)
    
    except Exception as e:
        logger.error(f"Error in mass scrape: {str(e)}")
        return jsonify({
            'error': 'Failed to perform mass scrape',
            'message': str(e)
        }), 500

# Data Import
@app.route('/api/import/file', methods=['POST'])
def import_file():
    """Import data from various file formats"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({
                'error': 'No file uploaded'
            }), 400
        
        file = request.files['file']
        file_type = request.form.get('file_type', '').lower()
        
        if not file_type:
            # Try to infer file type from extension
            filename = file.filename.lower()
            if filename.endswith('.csv'):
                file_type = 'csv'
            elif filename.endswith('.json'):
                file_type = 'json'
            elif filename.endswith('.md'):
                file_type = 'markdown'
            elif filename.endswith('.docx'):
                file_type = 'docx'
            else:
                return jsonify({
                    'error': 'Could not determine file type'
                }), 400
        
        # Save uploaded file temporarily
        temp_path = f"temp_import_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        file.save(temp_path)
        
        try:
            # Import the file
            imported_data = scraper.import_data_file(temp_path, file_type)
            
            return jsonify({
                'message': 'File imported successfully',
                'file_type': file_type,
                'items_imported': len(imported_data),
                'data': imported_data
            })
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        logger.error(f"Error importing file: {str(e)}")
        return jsonify({
            'error': 'Failed to import file',
            'message': str(e)
        }), 500

# Data Export
@app.route('/api/export/data', methods=['POST'])
def export_data():
    """Export data in specified format"""
    try:
        data = request.json
        required_fields = ['data', 'format']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        filename = data.get('filename')
        
        filepath = scraper.export_data(
            data=data['data'],
            format=data['format'],
            filename=filename
        )
        
        return jsonify({
            'message': 'Data exported successfully',
            'filepath': filepath,
            'format': data['format']
        })
    
    except Exception as e:
        logger.error(f"Error exporting data: {str(e)}")
        return jsonify({
            'error': 'Failed to export data',
            'message': str(e)
        }), 500

# AI-Powered Analysis
@app.route('/api/ai/analyze', methods=['POST'])
def ai_analyze():
    """Perform AI-powered competitive analysis"""
    try:
        data = request.json
        required_fields = ['data', 'analysis_type']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        analysis_type = data.get('analysis_type', 'comprehensive')
        
        analysis_result = ai_analyzer.analyze_competitive_data(
            data=data['data'],
            analysis_type=analysis_type
        )
        
        return jsonify(analysis_result)
    
    except Exception as e:
        logger.error(f"Error in AI analysis: {str(e)}")
        return jsonify({
            'error': 'Failed to perform AI analysis',
            'message': str(e)
        }), 500

@app.route('/api/ai/battlecard', methods=['POST'])
def generate_battlecard():
    """Generate AI-powered competitive battlecard"""
    try:
        data = request.json
        required_fields = ['company_name', 'competitors', 'data']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        battlecard = ai_analyzer.generate_competitive_battlecard(
            company_name=data['company_name'],
            competitors=data['competitors'],
            data=data['data']
        )
        
        return jsonify(battlecard)
    
    except Exception as e:
        logger.error(f"Error generating battlecard: {str(e)}")
        return jsonify({
            'error': 'Failed to generate battlecard',
            'message': str(e)
        }), 500

@app.route('/api/ai/content-strategy', methods=['POST'])
def analyze_content_strategy():
    """Analyze content strategy and messaging approaches"""
    try:
        data = request.json
        if 'data' not in data:
            return jsonify({
                'error': 'Missing required field: data'
            }), 400
        
        content_analysis = ai_analyzer.analyze_content_strategy(data=data['data'])
        
        return jsonify(content_analysis)
    
    except Exception as e:
        logger.error(f"Error analyzing content strategy: {str(e)}")
        return jsonify({
            'error': 'Failed to analyze content strategy',
            'message': str(e)
        }), 500

@app.route('/api/ai/competitive-moves', methods=['POST'])
def detect_competitive_moves():
    """Detect and analyze competitive moves"""
    try:
        data = request.json
        if 'data' not in data:
            return jsonify({
                'error': 'Missing required field: data'
            }), 400
        
        time_window = data.get('time_window_days', 30)
        
        competitive_moves = ai_analyzer.detect_competitive_moves(
            data=data['data'],
            time_window_days=time_window
        )
        
        return jsonify(competitive_moves)
    
    except Exception as e:
        logger.error(f"Error detecting competitive moves: {str(e)}")
        return jsonify({
            'error': 'Failed to detect competitive moves',
            'message': str(e)
        }), 500

# Enterprise Software Analysis
@app.route('/api/enterprise/analyze-category', methods=['POST'])
def analyze_software_category():
    """Analyze a specific software category for competitive intelligence"""
    try:
        data = request.json
        required_fields = ['category']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        products = data.get('products')  # Optional custom product list
        
        analysis_results = enterprise_analyzer.analyze_software_category(
            category=data['category'],
            products=products
        )
        
        return jsonify(analysis_results)
    
    except Exception as e:
        logger.error(f"Error analyzing software category: {str(e)}")
        return jsonify({
            'error': 'Failed to analyze software category',
            'message': str(e)
        }), 500

@app.route('/api/enterprise/generate-battlecard', methods=['POST'])
def generate_enterprise_battlecard():
    """Generate competitive battlecard for enterprise software"""
    try:
        data = request.json
        required_fields = ['company_name', 'competitors']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        battlecard = enterprise_analyzer.generate_competitive_battlecard(
            company_name=data['company_name'],
            competitors=data['competitors']
        )
        
        return jsonify(battlecard)
    
    except Exception as e:
        logger.error(f"Error generating enterprise battlecard: {str(e)}")
        return jsonify({
            'error': 'Failed to generate enterprise battlecard',
            'message': str(e)
        }), 500

# Analytics & Insights
@app.route('/api/analytics/summary', methods=['POST'])
def get_analytics_summary():
    """Get analytics summary for competitive intelligence data"""
    try:
        data = request.json
        if 'data' not in data:
            return jsonify({
                'error': 'Missing required field: data'
            }), 400
        
        # Extract key metrics
        summary_data = data['data']
        companies = summary_data.get('companies', {})
        
        # Calculate analytics
        analytics = {
            'overview': {
                'total_companies': summary_data.get('summary', {}).get('total_companies', 0),
                'total_items': summary_data.get('summary', {}).get('total_items', 0),
                'total_words': summary_data.get('summary', {}).get('total_words', 0),
                'total_links': summary_data.get('summary', {}).get('total_links', 0),
                'total_images': summary_data.get('summary', {}).get('total_images', 0),
                'rich_content_count': summary_data.get('summary', {}).get('rich_content_count', 0)
            },
            'company_performance': {},
            'category_breakdown': {},
            'content_quality_metrics': {}
        }
        
        # Company performance analysis
        for company, company_data in companies.items():
            if isinstance(company_data, dict) and 'error' not in company_data:
                analytics['company_performance'][company] = {
                    'total_items': company_data.get('summary', {}).get('total_items', 0),
                    'total_words': company_data.get('summary', {}).get('total_words', 0),
                    'rich_content_count': company_data.get('summary', {}).get('rich_content_count', 0),
                    'categories_analyzed': list(company_data.get('categories', {}).keys())
                }
        
        # Category breakdown
        category_totals = {}
        for company_data in companies.values():
            if isinstance(company_data, dict) and 'error' not in company_data:
                for category, category_data in company_data.get('categories', {}).items():
                    if isinstance(category_data, dict) and 'error' not in category_data:
                        if category not in category_totals:
                            category_totals[category] = {
                                'total_items': 0,
                                'total_words': 0,
                                'companies_analyzed': set()
                            }
                        
                        category_totals[category]['total_items'] += len(category_data.get('items', []))
                        category_totals[category]['total_words'] += category_data.get('total_words', 0)
                        category_totals[category]['companies_analyzed'].add(company_data.get('company', 'Unknown'))
        
        # Convert sets to lists for JSON serialization
        for category in category_totals:
            category_totals[category]['companies_analyzed'] = list(category_totals[category]['companies_analyzed'])
        
        analytics['category_breakdown'] = category_totals
        
        # Content quality metrics
        total_items = analytics['overview']['total_items']
        if total_items > 0:
            analytics['content_quality_metrics'] = {
                'average_words_per_item': round(analytics['overview']['total_words'] / total_items, 2),
                'rich_content_percentage': round((analytics['overview']['rich_content_count'] / total_items) * 100, 2),
                'link_density': round(analytics['overview']['total_links'] / total_items, 2),
                'image_density': round(analytics['overview']['total_images'] / total_items, 2)
            }
        
        return jsonify(analytics)
    
    except Exception as e:
        logger.error(f"Error generating analytics summary: {str(e)}")
        return jsonify({
            'error': 'Failed to generate analytics summary',
            'message': str(e)
        }), 500

# Search & Filtering
@app.route('/api/search/content', methods=['POST'])
def search_content():
    """Search across content, companies, and categories"""
    try:
        data = request.json
        required_fields = ['query', 'data']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        query = data['query'].lower()
        search_data = data['data']
        companies = search_data.get('companies', {})
        
        search_results = []
        
        # Search through all content
        for company, company_data in companies.items():
            if isinstance(company_data, dict) and 'error' not in company_data:
                for category, category_data in company_data.get('categories', {}).items():
                    if isinstance(category_data, dict) and 'error' not in category_data:
                        for item in category_data.get('items', []):
                            # Search in title, content, and company name
                            title = item.get('title', '').lower()
                            content = item.get('content', '').lower()
                            company_name = company.lower()
                            
                            if (query in title or query in content or query in company_name):
                                search_results.append({
                                    'item': item,
                                    'company': company,
                                    'category': category,
                                    'relevance_score': _calculate_relevance_score(query, title, content, company_name)
                                })
        
        # Sort by relevance score
        search_results.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return jsonify({
            'query': data['query'],
            'total_results': len(search_results),
            'results': search_results
        })
    
    except Exception as e:
        logger.error(f"Error searching content: {str(e)}")
        return jsonify({
            'error': 'Failed to search content',
            'message': str(e)
        }), 500

def _calculate_relevance_score(query: str, title: str, content: str, company: str) -> float:
    """Calculate relevance score for search results"""
    score = 0.0
    
    # Title matches get highest weight
    if query in title:
        score += 10.0
    
    # Company name matches get high weight
    if query in company:
        score += 8.0
    
    # Content matches get medium weight
    if query in content:
        score += 5.0
    
    # Partial matches
    for word in query.split():
        if word in title:
            score += 2.0
        if word in content:
            score += 1.0
    
    return score

# File Download
@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename: str):
    """Download generated files"""
    try:
        file_path = filename
        
        if not os.path.exists(file_path):
            return jsonify({
                'error': 'File not found',
                'message': f'Could not find file: {filename}'
            }), 404
        
        return send_file(file_path, as_attachment=True)
    
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        return jsonify({
            'error': 'Could not download file',
            'message': str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not found',
        'message': 'The requested resource was not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500

# Main execution
if __name__ == '__main__':
    # Ensure output directories exist
    os.makedirs('competitive_intelligence_output', exist_ok=True)
    os.makedirs('enterprise_software_output', exist_ok=True)
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=3001) 