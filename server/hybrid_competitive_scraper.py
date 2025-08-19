#!/usr/bin/env python3
"""
Hybrid Competitive Intelligence Scraper

This module combines dynamic bulk scraping from third-party sources with
surgical hardcoded scraping from official documentation to provide
comprehensive competitive intelligence.
"""

import json
import logging
import time
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import os

from dynamic_bulk_scraper import DynamicBulkScraper
from competitive_intelligence_db import CompetitiveIntelligenceDB

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HybridCompetitiveScraper:
    """Hybrid scraper combining dynamic and surgical approaches"""
    
    def __init__(self, db_path: str = "competitive_intelligence.db"):
        self.dynamic_scraper = DynamicBulkScraper()
        self.db = CompetitiveIntelligenceDB(db_path)
        
        # Load Sigma preset data
        self.sigma_data = self._load_sigma_preset_data()
        
        # Load competitor targeting data
        self.competitors = self._load_competitor_targeting()
        
        # Define the 10 strategic dimensions
        self.dimensions = [
            'spreadsheet_interface',
            'semantic_layer_integration',
            'data_app_development',
            'multi_modal_development',
            'writeback',
            'ai_model_flexibility',
            'unstructured_data_querying',
            'governed_collaboration',
            'materialization_controls',
            'lineage'
        ]
        
        # Initialize Sigma data in database
        self._initialize_sigma_data()
    
    def _load_sigma_preset_data(self) -> Dict[str, Any]:
        """Load Sigma's preset competitive positioning data"""
        try:
            # Try to load from the preset file
            preset_file = "../sigma_preset_competitive_data.json"
            if os.path.exists(preset_file):
                with open(preset_file, 'r') as f:
                    return json.load(f)
            else:
                # Fallback to basic Sigma data
                return self._get_basic_sigma_data()
        except Exception as e:
            logger.warning(f"Could not load Sigma preset data: {e}")
            return self._get_basic_sigma_data()
    
    def _get_basic_sigma_data(self) -> Dict[str, Any]:
        """Get basic Sigma data if preset file is not available"""
        return {
            "company_info": {
                "name": "Sigma",
                "domain": "https://www.sigmacomputing.com/",
                "description": "Cloud-native analytics platform with spreadsheet interface"
            },
            "competitive_positioning": {
                "spreadsheet_interface": {"score": 9.5},
                "semantic_layer_integration": {"score": 8.8},
                "data_app_development": {"score": 8.2},
                "multi_modal_development": {"score": 7.8},
                "writeback": {"score": 7.5},
                "ai_model_flexibility": {"score": 7.2},
                "unstructured_data_querying": {"score": 6.8},
                "governed_collaboration": {"score": 8.5},
                "materialization_controls": {"score": 7.8},
                "lineage": {"score": 8.2}
            }
        }
    
    def _load_competitor_targeting(self) -> List[str]:
        """Load competitor list from competitor_targeting.py"""
        try:
            # Import competitor list
            from competitor_targeting import COMPETITORS
            return [comp['name'] for comp in COMPETITORS]
        except ImportError:
            # Fallback to hardcoded list
            return [
                "Snowflake", "Databricks", "PowerBI", "Tableau", "Omni",
                "Looker", "Oracle", "SAP BusinessObjects", "Qlik", "MicroStrategy",
                "Hex", "Thoughtspot", "Domo", "IBM Cognos"
            ]
    
    def _initialize_sigma_data(self):
        """Initialize Sigma's preset data in the database"""
        try:
            # Insert Sigma company
            sigma_info = self.sigma_data['company_info']
            self.db.insert_company(
                sigma_info['name'],
                sigma_info['domain'],
                sigma_info['description']
            )
            
            # Insert Sigma's competitive positioning scores
            for dimension, data in self.sigma_data['competitive_positioning'].items():
                # Create mock competitive intelligence data for Sigma
                mock_data = [{
                    'source_type': 'preset_company_data',
                    'source_url': sigma_info['domain'],
                    'title': f"Sigma {dimension.replace('_', ' ').title()}",
                    'content': f"Sigma's capabilities in {dimension.replace('_', ' ')}",
                    'sentiment': 'positive',
                    'rating': data.get('score', 0),
                    'relevance_score': 1.0,
                    'confidence_score': 1.0,
                    'extraction_date': datetime.now().isoformat()
                }]
                
                self.db.insert_competitive_intelligence(
                    sigma_info['name'], dimension, mock_data
                )
            
            logger.info("Sigma data initialized in database")
            
        except Exception as e:
            logger.error(f"Error initializing Sigma data: {e}")
    
    def scrape_competitor_dimension(self, competitor_name: str, dimension: str) -> Dict[str, Any]:
        """Scrape competitive intelligence for a specific competitor and dimension"""
        logger.info(f"Scraping {competitor_name} for dimension: {dimension}")
        
        results = {
            'competitor': competitor_name,
            'dimension': dimension,
            'scraping_timestamp': datetime.now().isoformat(),
            'dynamic_scraping_results': [],
            'surgical_scraping_results': [],
            'summary': {}
        }
        
        try:
            # Step 1: Dynamic bulk scraping from third-party sources
            logger.info(f"Starting dynamic scraping for {competitor_name} - {dimension}")
            dynamic_results = self.dynamic_scraper.scrape_company_dimension(
                competitor_name, dimension
            )
            results['dynamic_scraping_results'] = dynamic_results
            
            # Step 2: Surgical hardcoded scraping (placeholder for future implementation)
            logger.info(f"Starting surgical scraping for {competitor_name} - {dimension}")
            surgical_results = self._surgical_scrape_competitor_dimension(
                competitor_name, dimension
            )
            results['surgical_scraping_results'] = surgical_results
            
            # Step 3: Store results in database
            all_results = dynamic_results + surgical_results
            if all_results:
                inserted_count = self.db.insert_competitive_intelligence(
                    competitor_name, dimension, all_results
                )
                logger.info(f"Stored {inserted_count} competitive intelligence records")
            
            # Step 4: Generate summary
            results['summary'] = {
                'total_results': len(all_results),
                'dynamic_results': len(dynamic_results),
                'surgical_results': len(surgical_results),
                'success': True
            }
            
        except Exception as e:
            logger.error(f"Error scraping {competitor_name} for {dimension}: {e}")
            results['summary'] = {
                'total_results': 0,
                'dynamic_results': 0,
                'surgical_results': 0,
                'success': False,
                'error': str(e)
            }
        
        return results
    
    def _surgical_scrape_competitor_dimension(self, competitor_name: str, dimension: str) -> List[Dict[str, Any]]:
        """Surgical scraping from hardcoded documentation URLs (placeholder)"""
        # This is a placeholder for future surgical scraping implementation
        # For now, return empty list
        logger.info(f"Surgical scraping placeholder for {competitor_name} - {dimension}")
        return []
    
    def scrape_competitor_all_dimensions(self, competitor_name: str) -> Dict[str, Any]:
        """Scrape all dimensions for a specific competitor"""
        logger.info(f"Scraping all dimensions for {competitor_name}")
        
        results = {
            'competitor': competitor_name,
            'scraping_timestamp': datetime.now().isoformat(),
            'dimension_results': {},
            'summary': {}
        }
        
        total_results = 0
        successful_dimensions = 0
        
        for dimension in self.dimensions:
            try:
                dimension_result = self.scrape_competitor_dimension(competitor_name, dimension)
                results['dimension_results'][dimension] = dimension_result
                
                if dimension_result['summary']['success']:
                    successful_dimensions += 1
                    total_results += dimension_result['summary']['total_results']
                
                # Add delay between dimensions
                time.sleep(2)
                
            except Exception as e:
                logger.error(f"Error scraping {competitor_name} for {dimension}: {e}")
                results['dimension_results'][dimension] = {
                    'error': str(e),
                    'success': False
                }
        
        results['summary'] = {
            'total_dimensions': len(self.dimensions),
            'successful_dimensions': successful_dimensions,
            'total_results': total_results,
            'success_rate': successful_dimensions / len(self.dimensions) if self.dimensions else 0
        }
        
        return results
    
    def scrape_all_competitors_dimension(self, dimension: str) -> Dict[str, Any]:
        """Scrape a specific dimension for all competitors"""
        logger.info(f"Scraping {dimension} for all competitors")
        
        results = {
            'dimension': dimension,
            'scraping_timestamp': datetime.now().isoformat(),
            'competitor_results': {},
            'summary': {}
        }
        
        total_results = 0
        successful_competitors = 0
        
        for competitor in self.competitors:
            try:
                competitor_result = self.scrape_competitor_dimension(competitor, dimension)
                results['competitor_results'][competitor] = competitor_result
                
                if competitor_result['summary']['success']:
                    successful_competitors += 1
                    total_results += competitor_result['summary']['total_results']
                
                # Add delay between competitors
                time.sleep(3)
                
            except Exception as e:
                logger.error(f"Error scraping {competitor} for {dimension}: {e}")
                results['competitor_results'][competitor] = {
                    'error': str(e),
                    'success': False
                }
        
        results['summary'] = {
            'total_competitors': len(self.competitors),
            'successful_competitors': successful_competitors,
            'total_results': total_results,
            'success_rate': successful_competitors / len(self.competitors) if self.competitors else 0
        }
        
        return results
    
    def get_competitive_comparison(self, competitor_name: str) -> Dict[str, Any]:
        """Get competitive comparison between Sigma and a competitor"""
        try:
            # Get Sigma's data
            sigma_overview = self.db.get_company_overview("Sigma")
            
            # Get competitor's data
            competitor_overview = self.db.get_company_overview(competitor_name)
            
            if not competitor_overview:
                return {
                    'error': f"No data found for {competitor_name}",
                    'sigma_data': sigma_overview
                }
            
            # Create comparison
            comparison = {
                'comparison_timestamp': datetime.now().isoformat(),
                'sigma': {
                    'company_info': sigma_overview.get('company_info', {}),
                    'dimension_scores': sigma_overview.get('dimension_scores', [])
                },
                'competitor': {
                    'company_info': competitor_overview.get('company_info', {}),
                    'dimension_scores': competitor_overview.get('dimension_scores', [])
                },
                'analysis': self._analyze_competitive_positioning(
                    sigma_overview, competitor_overview
                )
            }
            
            return comparison
            
        except Exception as e:
            logger.error(f"Error getting competitive comparison for {competitor_name}: {e}")
            return {'error': str(e)}
    
    def _analyze_competitive_positioning(self, sigma_data: Dict, competitor_data: Dict) -> Dict[str, Any]:
        """Analyze competitive positioning between Sigma and competitor"""
        analysis = {
            'sigma_advantages': [],
            'competitor_advantages': [],
            'competitive_gaps': [],
            'overall_assessment': {}
        }
        
        try:
            # Create dimension score mapping
            sigma_scores = {
                score['dimension_name']: score['aggregated_score']
                for score in sigma_data.get('dimension_scores', [])
            }
            
            competitor_scores = {
                score['dimension_name']: score['aggregated_score']
                for score in competitor_data.get('dimension_scores', [])
            }
            
            # Analyze each dimension
            for dimension in self.dimensions:
                dimension_display = dimension.replace('_', ' ').title()
                sigma_score = sigma_scores.get(dimension, 0)
                competitor_score = competitor_scores.get(dimension, 0)
                
                if sigma_score > competitor_score:
                    advantage = sigma_score - competitor_score
                    analysis['sigma_advantages'].append({
                        'dimension': dimension_display,
                        'advantage': advantage,
                        'sigma_score': sigma_score,
                        'competitor_score': competitor_score
                    })
                elif competitor_score > sigma_score:
                    advantage = competitor_score - sigma_score
                    analysis['competitor_advantages'].append({
                        'dimension': dimension_display,
                        'advantage': advantage,
                        'sigma_score': sigma_score,
                        'competitor_score': competitor_score
                    })
                
                # Identify gaps
                if abs(sigma_score - competitor_score) > 2.0:
                    analysis['competitive_gaps'].append({
                        'dimension': dimension_display,
                        'gap_size': abs(sigma_score - competitor_score),
                        'sigma_score': sigma_score,
                        'competitor_score': competitor_score
                    })
            
            # Overall assessment
            total_sigma_score = sum(sigma_scores.values())
            total_competitor_score = sum(competitor_scores.values())
            
            analysis['overall_assessment'] = {
                'sigma_total_score': total_sigma_score,
                'competitor_total_score': total_competitor_score,
                'score_difference': total_sigma_score - total_competitor_score,
                'sigma_advantage_count': len(analysis['sigma_advantages']),
                'competitor_advantage_count': len(analysis['competitor_advantages']),
                'competitive_gap_count': len(analysis['competitive_gaps'])
            }
            
        except Exception as e:
            logger.error(f"Error analyzing competitive positioning: {e}")
            analysis['error'] = str(e)
        
        return analysis
    
    def export_competitive_analysis(self, competitor_name: str, output_file: str = None) -> str:
        """Export competitive analysis to JSON file"""
        try:
            comparison = self.get_competitive_comparison(competitor_name)
            
            if 'error' in comparison:
                return ""
            
            if not output_file:
                output_file = f"sigma_vs_{competitor_name.lower().replace(' ', '_')}_analysis.json"
            
            with open(output_file, 'w') as f:
                json.dump(comparison, f, indent=2, default=str)
            
            logger.info(f"Exported competitive analysis to {output_file}")
            return output_file
            
        except Exception as e:
            logger.error(f"Error exporting competitive analysis: {e}")
            return ""
    
    def get_scraping_status(self) -> Dict[str, Any]:
        """Get overall scraping status and statistics"""
        try:
            companies = self.db.get_all_companies()
            dimensions = self.db.get_all_dimensions()
            
            # Get scraping statistics
            total_companies = len(companies)
            total_dimensions = len(dimensions)
            
            # Count companies with data
            companies_with_data = 0
            total_data_points = 0
            
            for company in companies:
                company_name = company['name']
                company_overview = self.db.get_company_overview(company_name)
                
                if company_overview.get('total_intelligence_items', 0) > 0:
                    companies_with_data += 1
                    total_data_points += company_overview.get('total_intelligence_items', 0)
            
            return {
                'status_timestamp': datetime.now().isoformat(),
                'total_companies': total_companies,
                'total_dimensions': total_dimensions,
                'companies_with_data': companies_with_data,
                'total_data_points': total_data_points,
                'data_coverage': companies_with_data / total_companies if total_companies > 0 else 0,
                'dimensions_covered': total_dimensions
            }
            
        except Exception as e:
            logger.error(f"Error getting scraping status: {e}")
            return {'error': str(e)}

def main():
    """Test the hybrid competitive scraper"""
    scraper = HybridCompetitiveScraper("test_competitive_intelligence.db")
    
    # Test scraping a single competitor dimension
    print("Testing hybrid scraper...")
    
    test_competitor = "Snowflake"
    test_dimension = "spreadsheet_interface"
    
    print(f"Scraping {test_competitor} for {test_dimension}")
    result = scraper.scrape_competitor_dimension(test_competitor, test_dimension)
    
    print(f"Scraping completed: {result['summary']}")
    
    # Test getting competitive comparison
    print(f"\nGetting competitive comparison for {test_competitor}")
    comparison = scraper.get_competitive_comparison(test_competitor)
    
    if 'error' not in comparison:
        print(f"Comparison completed: {comparison['analysis']['overall_assessment']}")
    else:
        print(f"Comparison error: {comparison['error']}")
    
    # Test getting scraping status
    print("\nGetting scraping status...")
    status = scraper.get_scraping_status()
    print(f"Status: {status}")
    
    # Clean up test database
    os.remove("test_competitive_intelligence.db")
    print("\nTest completed successfully")

if __name__ == "__main__":
    main()
