# enterprise_software_analyzer.py
import os
import json
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
from dotenv import load_dotenv
import time
import re
from urllib.parse import urlparse
import hashlib

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler('enterprise_software_analysis.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EnterpriseSoftwareAnalyzer:
    """
    Comprehensive enterprise software analysis engine for competitive intelligence
    """
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        self.software_categories = self._load_software_categories()
        self.documentation_sources = self._initialize_sources()
        self.metrics_tracker = MetricsTracker()
        self.change_detector = ChangeDetectionEngine()
        self.competitive_analyzer = CompetitiveAnalyzer()
        
    def _load_software_categories(self) -> Dict[str, List[str]]:
        """Load predefined software categories for analysis"""
        return {
            "customer_relationship_management": [
                "Salesforce", "HubSpot", "Microsoft_Dynamics", "Oracle_CRM"
            ],
            "enterprise_resource_planning": [
                "SAP", "Oracle_ERP", "Microsoft_Dynamics_365", "NetSuite"
            ],
            "business_intelligence": [
                "Tableau", "Power_BI", "Qlik", "Looker", "Domo"
            ],
            "project_management": [
                "Jira", "Asana", "Monday.com", "ClickUp", "Notion"
            ],
            "communication_collaboration": [
                "Slack", "Microsoft_Teams", "Zoom", "Webex", "Discord"
            ],
            "development_tools": [
                "GitHub", "GitLab", "Bitbucket", "Azure_DevOps", "Jira_Software"
            ],
            "cloud_infrastructure": [
                "AWS", "Azure", "Google_Cloud", "IBM_Cloud", "Oracle_Cloud"
            ],
            "security_software": [
                "CrowdStrike", "Palo_Alto_Networks", "Symantec", "McAfee", "Trend_Micro"
            ]
        }
    
    def _initialize_sources(self) -> Dict[str, Dict]:
        """Initialize documentation sources for each software category"""
        sources = {}
        for category, products in self.software_categories.items():
            sources[category] = {
                'official_docs': self._get_official_documentation_urls(products),
                'api_docs': self._get_api_documentation_urls(products),
                'community_sources': self._get_community_source_urls(products),
                'social_media': self._get_social_media_accounts(products)
            }
        return sources
    
    def _get_official_documentation_urls(self, products: List[str]) -> Dict[str, str]:
        """Generate official documentation URLs for products"""
        base_urls = {
            "Salesforce": "https://developer.salesforce.com/docs",
            "HubSpot": "https://developers.hubspot.com/docs",
            "Microsoft_Dynamics": "https://docs.microsoft.com/en-us/dynamics365",
            "Oracle_CRM": "https://docs.oracle.com/en/applications/sales",
            "SAP": "https://help.sap.com",
            "Tableau": "https://help.tableau.com",
            "Power_BI": "https://docs.microsoft.com/en-us/power-bi",
            "Jira": "https://confluence.atlassian.com/jira",
            "Asana": "https://developers.asana.com/docs",
            "Slack": "https://api.slack.com/docs",
            "GitHub": "https://docs.github.com",
            "AWS": "https://docs.aws.amazon.com",
            "Azure": "https://docs.microsoft.com/en-us/azure"
        }
        
        return {product: base_urls.get(product, f"https://{product.lower()}.com/docs") 
                for product in products}
    
    def _get_api_documentation_urls(self, products: List[str]) -> Dict[str, str]:
        """Generate API documentation URLs for products"""
        api_urls = {
            "Salesforce": "https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest",
            "HubSpot": "https://developers.hubspot.com/docs/api/overview",
            "Slack": "https://api.slack.com/web",
            "GitHub": "https://docs.github.com/en/rest",
            "AWS": "https://docs.aws.amazon.com/index.html",
            "Azure": "https://docs.microsoft.com/en-us/rest/api/azure"
        }
        
        return {product: api_urls.get(product, f"https://{product.lower()}.com/api") 
                for product in products}
    
    def _get_community_source_urls(self, products: List[str]) -> Dict[str, List[str]]:
        """Generate community source URLs for products"""
        community_sources = {
            "Salesforce": ["https://trailhead.salesforce.com", "https://developer.salesforce.com/forums"],
            "HubSpot": ["https://community.hubspot.com", "https://developers.hubspot.com/community"],
            "GitHub": ["https://github.com/topics", "https://github.com/explore"],
            "AWS": ["https://aws.amazon.com/blogs", "https://stackoverflow.com/questions/tagged/amazon-web-services"]
        }
        
        return {product: community_sources.get(product, [f"https://{product.lower()}.com/community"]) 
                for product in products}
    
    def _get_social_media_accounts(self, products: List[str]) -> Dict[str, List[str]]:
        """Generate social media account URLs for products"""
        social_accounts = {
            "Salesforce": ["https://twitter.com/salesforce", "https://linkedin.com/company/salesforce"],
            "HubSpot": ["https://twitter.com/hubspot", "https://linkedin.com/company/hubspot"],
            "GitHub": ["https://twitter.com/github", "https://linkedin.com/company/github"],
            "AWS": ["https://twitter.com/awscloud", "https://linkedin.com/company/amazon-web-services"]
        }
        
        return {product: social_accounts.get(product, [f"https://{product.lower()}.com/social"]) 
                for product in products}
    
    def analyze_software_category(self, category: str, products: Optional[List[str]] = None) -> Dict[str, Any]:
        """Analyze a specific software category for competitive intelligence"""
        if products is None:
            products = self.software_categories.get(category, [])
        
        analysis_results = {
            'category': category,
            'products_analyzed': len(products),
            'analysis_timestamp': datetime.now().isoformat(),
            'product_analyses': {},
            'category_insights': {},
            'competitive_positioning': {},
            'risk_assessment': {}
        }
        
        for product in products:
            try:
                logger.info(f"Analyzing {product} in category {category}")
                product_analysis = self._analyze_single_product(product, category)
                analysis_results['product_analyses'][product] = product_analysis
                
                # Add delay to avoid overwhelming servers
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error analyzing {product}: {str(e)}")
                analysis_results['product_analyses'][product] = {
                    'error': str(e),
                    'status': 'failed'
                }
        
        # Generate category-level insights
        analysis_results['category_insights'] = self._generate_category_insights(
            analysis_results['product_analyses']
        )
        
        # Generate competitive positioning analysis
        analysis_results['competitive_positioning'] = self.competitive_analyzer.analyze_category_positioning(
            category, analysis_results['product_analyses']
        )
        
        # Generate risk assessment
        analysis_results['risk_assessment'] = self._assess_category_risks(
            analysis_results['product_analyses']
        )
        
        return analysis_results
    
    def _analyze_single_product(self, product: str, category: str) -> Dict[str, Any]:
        """Analyze a single software product"""
        analysis = {
            'product_name': product,
            'category': category,
            'analysis_timestamp': datetime.now().isoformat(),
            'documentation_quality': {},
            'api_stability': {},
            'feature_evolution': {},
            'market_position': {},
            'integration_ecosystem': {},
            'risk_factors': {}
        }
        
        # Analyze documentation quality
        analysis['documentation_quality'] = self._assess_documentation_quality(product, category)
        
        # Analyze API stability
        analysis['api_stability'] = self._assess_api_stability(product, category)
        
        # Analyze feature evolution
        analysis['feature_evolution'] = self._analyze_feature_evolution(product, category)
        
        # Analyze market position
        analysis['market_position'] = self._analyze_market_position(product, category)
        
        # Analyze integration ecosystem
        analysis['integration_ecosystem'] = self._analyze_integration_ecosystem(product, category)
        
        # Assess risk factors
        analysis['risk_factors'] = self._assess_product_risks(analysis)
        
        return analysis
    
    def _assess_documentation_quality(self, product: str, category: str) -> Dict[str, Any]:
        """Assess the quality of product documentation"""
        # This would integrate with actual web scraping in a real implementation
        # For now, return mock assessment based on known product characteristics
        
        documentation_scores = {
            "Salesforce": {"completeness": 95, "clarity": 90, "examples": 85, "updates": 80},
            "HubSpot": {"completeness": 88, "clarity": 92, "examples": 90, "updates": 85},
            "GitHub": {"completeness": 92, "clarity": 88, "examples": 95, "updates": 90},
            "AWS": {"completeness": 98, "clarity": 85, "examples": 88, "updates": 95}
        }
        
        base_score = documentation_scores.get(product, {
            "completeness": 75, "clarity": 75, "examples": 70, "updates": 70
        })
        
        return {
            'overall_score': sum(base_score.values()) / len(base_score),
            'completeness': base_score['completeness'],
            'clarity': base_score['clarity'],
            'examples': base_score['examples'],
            'update_frequency': base_score['updates'],
            'assessment_date': datetime.now().isoformat()
        }
    
    def _assess_api_stability(self, product: str, category: str) -> Dict[str, Any]:
        """Assess API stability based on change history"""
        # Mock API stability assessment
        stability_profiles = {
            "AWS": {"breaking_changes": 2, "deprecations": 5, "new_endpoints": 45, "stability_score": 85},
            "Salesforce": {"breaking_changes": 8, "deprecations": 12, "new_endpoints": 38, "stability_score": 72},
            "HubSpot": {"breaking_changes": 5, "deprecations": 8, "new_endpoints": 42, "stability_score": 78},
            "GitHub": {"breaking_changes": 3, "deprecations": 6, "new_endpoints": 52, "stability_score": 88}
        }
        
        profile = stability_profiles.get(product, {
            "breaking_changes": 10, "deprecations": 15, "new_endpoints": 30, "stability_score": 65
        })
        
        return {
            'stability_score': profile['stability_score'],
            'breaking_changes_last_year': profile['breaking_changes'],
            'deprecated_endpoints': profile['deprecations'],
            'new_endpoints_last_year': profile['new_endpoints'],
            'risk_level': 'high' if profile['stability_score'] < 70 else 'medium' if profile['stability_score'] < 85 else 'low',
            'assessment_date': datetime.now().isoformat()
        }
    
    def _analyze_feature_evolution(self, product: str, category: str) -> Dict[str, Any]:
        """Analyze feature evolution and release patterns"""
        # Mock feature evolution analysis
        evolution_patterns = {
            "Salesforce": {"releases_per_year": 4, "major_features": 12, "innovation_focus": "AI/ML", "adoption_speed": "fast"},
            "HubSpot": {"releases_per_year": 6, "major_features": 18, "innovation_focus": "Automation", "adoption_speed": "very_fast"},
            "GitHub": {"releases_per_year": 12, "major_features": 24, "innovation_focus": "Developer Experience", "adoption_speed": "fast"},
            "AWS": {"releases_per_year": 20, "major_features": 50, "innovation_focus": "Cloud Services", "adoption_speed": "very_fast"}
        }
        
        pattern = evolution_patterns.get(product, {
            "releases_per_year": 3, "major_features": 8, "innovation_focus": "Core Features", "adoption_speed": "medium"
        })
        
        return {
            'release_frequency': pattern['releases_per_year'],
            'major_features_last_year': pattern['major_features'],
            'innovation_focus': pattern['innovation_focus'],
            'adoption_speed': pattern['adoption_speed'],
            'evolution_score': min(100, pattern['releases_per_year'] * 3 + pattern['major_features'] * 2),
            'assessment_date': datetime.now().isoformat()
        }
    
    def _analyze_market_position(self, product: str, category: str) -> Dict[str, Any]:
        """Analyze market position and competitive standing"""
        # Mock market position analysis
        market_positions = {
            "Salesforce": {"market_share": 19.8, "customer_satisfaction": 4.2, "brand_recognition": "very_high", "competitive_strength": "leader"},
            "HubSpot": {"market_share": 3.2, "customer_satisfaction": 4.5, "brand_recognition": "high", "competitive_strength": "challenger"},
            "GitHub": {"market_share": 45.1, "customer_satisfaction": 4.3, "brand_recognition": "very_high", "competitive_strength": "leader"},
            "AWS": {"market_share": 32.1, "customer_satisfaction": 4.1, "brand_recognition": "very_high", "competitive_strength": "leader"}
        }
        
        position = market_positions.get(product, {
            "market_share": 2.0, "customer_satisfaction": 3.8, "brand_recognition": "medium", "competitive_strength": "follower"
        })
        
        return {
            'market_share_percentage': position['market_share'],
            'customer_satisfaction_score': position['customer_satisfaction'],
            'brand_recognition': position['brand_recognition'],
            'competitive_strength': position['competitive_strength'],
            'market_position_score': self._calculate_market_position_score(position),
            'assessment_date': datetime.now().isoformat()
        }
    
    def _analyze_integration_ecosystem(self, product: str, category: str) -> Dict[str, Any]:
        """Analyze integration ecosystem and partner network"""
        # Mock integration ecosystem analysis
        ecosystems = {
            "Salesforce": {"total_integrations": 2500, "api_endpoints": 1200, "webhook_support": True, "sdk_languages": 8},
            "HubSpot": {"total_integrations": 1200, "api_endpoints": 800, "webhook_support": True, "sdk_languages": 6},
            "GitHub": {"total_integrations": 800, "api_endpoints": 600, "webhook_support": True, "sdk_languages": 10},
            "AWS": {"total_integrations": 5000, "api_endpoints": 3000, "webhook_support": True, "sdk_languages": 12}
        }
        
        ecosystem = ecosystems.get(product, {
            "total_integrations": 500, "api_endpoints": 300, "webhook_support": False, "sdk_languages": 4
        })
        
        return {
            'total_integrations': ecosystem['total_integrations'],
            'api_endpoints': ecosystem['api_endpoints'],
            'webhook_support': ecosystem['webhook_support'],
            'sdk_languages_supported': ecosystem['sdk_languages'],
            'ecosystem_maturity_score': min(100, ecosystem['total_integrations'] // 10 + ecosystem['api_endpoints'] // 5),
            'assessment_date': datetime.now().isoformat()
        }
    
    def _assess_product_risks(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Assess overall product risks based on analysis"""
        risk_score = 0
        risk_factors = []
        
        # API stability risks
        if analysis['api_stability']['risk_level'] == 'high':
            risk_score += 30
            risk_factors.append('High API instability')
        elif analysis['api_stability']['risk_level'] == 'medium':
            risk_score += 15
            risk_factors.append('Moderate API instability')
        
        # Documentation quality risks
        if analysis['documentation_quality']['overall_score'] < 70:
            risk_score += 20
            risk_factors.append('Poor documentation quality')
        elif analysis['documentation_quality']['overall_score'] < 80:
            risk_score += 10
            risk_factors.append('Below-average documentation quality')
        
        # Market position risks
        if analysis['market_position']['competitive_strength'] == 'follower':
            risk_score += 15
            risk_factors.append('Weak competitive position')
        
        # Integration ecosystem risks
        if analysis['integration_ecosystem']['ecosystem_maturity_score'] < 50:
            risk_score += 15
            risk_factors.append('Immature integration ecosystem')
        
        return {
            'overall_risk_score': min(100, risk_score),
            'risk_level': 'high' if risk_score > 50 else 'medium' if risk_score > 25 else 'low',
            'risk_factors': risk_factors,
            'mitigation_recommendations': self._generate_risk_mitigation_recommendations(risk_factors),
            'assessment_date': datetime.now().isoformat()
        }
    
    def _generate_risk_mitigation_recommendations(self, risk_factors: List[str]) -> List[str]:
        """Generate risk mitigation recommendations"""
        recommendations = []
        
        for factor in risk_factors:
            if 'API instability' in factor:
                recommendations.append('Implement comprehensive API versioning strategy')
                recommendations.append('Establish monitoring for breaking changes')
            elif 'documentation quality' in factor:
                recommendations.append('Invest in documentation improvement')
                recommendations.append('Establish documentation review processes')
            elif 'competitive position' in factor:
                recommendations.append('Focus on differentiation and innovation')
                recommendations.append('Strengthen market positioning')
            elif 'integration ecosystem' in factor:
                recommendations.append('Develop strategic partnerships')
                recommendations.append('Invest in API development')
        
        return recommendations
    
    def _calculate_market_position_score(self, position: Dict[str, Any]) -> float:
        """Calculate market position score based on various factors"""
        score = 0
        
        # Market share contribution (max 40 points)
        score += min(40, position['market_share'] * 2)
        
        # Customer satisfaction contribution (max 30 points)
        score += min(30, position['customer_satisfaction'] * 7.5)
        
        # Brand recognition contribution (max 20 points)
        recognition_scores = {"very_high": 20, "high": 15, "medium": 10, "low": 5}
        score += recognition_scores.get(position['brand_recognition'], 5)
        
        # Competitive strength contribution (max 10 points)
        strength_scores = {"leader": 10, "challenger": 7, "follower": 4, "niche": 2}
        score += strength_scores.get(position['competitive_strength'], 2)
        
        return min(100, score)
    
    def _generate_category_insights(self, product_analyses: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insights at the category level"""
        if not product_analyses:
            return {}
        
        # Calculate category averages
        total_products = len(product_analyses)
        successful_analyses = {k: v for k, v in product_analyses.items() if 'error' not in v}
        
        if not successful_analyses:
            return {'error': 'No successful analyses to generate insights'}
        
        # Aggregate metrics
        avg_api_stability = np.mean([v['api_stability']['stability_score'] 
                                   for v in successful_analyses.values()])
        avg_documentation_quality = np.mean([v['documentation_quality']['overall_score'] 
                                           for v in successful_analyses.values()])
        avg_market_position = np.mean([v['market_position']['market_position_score'] 
                                     for v in successful_analyses.values()])
        
        return {
            'total_products_analyzed': total_products,
            'successful_analyses': len(successful_analyses),
            'average_api_stability': round(avg_api_stability, 2),
            'average_documentation_quality': round(avg_documentation_quality, 2),
            'average_market_position': round(avg_market_position, 2),
            'category_health_score': round((avg_api_stability + avg_documentation_quality + avg_market_position) / 3, 2),
            'insights_generated': datetime.now().isoformat()
        }
    
    def _assess_category_risks(self, product_analyses: Dict[str, Any]) -> Dict[str, Any]:
        """Assess risks at the category level"""
        if not product_analyses:
            return {}
        
        successful_analyses = {k: v for k, v in product_analyses.items() if 'error' not in v}
        
        if not successful_analyses:
            return {'error': 'No successful analyses to assess risks'}
        
        # Count high-risk products
        high_risk_products = sum(1 for v in successful_analyses.values() 
                                if v['risk_factors']['risk_level'] == 'high')
        medium_risk_products = sum(1 for v in successful_analyses.values() 
                                  if v['risk_factors']['risk_level'] == 'medium')
        
        total_products = len(successful_analyses)
        
        return {
            'total_products': total_products,
            'high_risk_count': high_risk_products,
            'medium_risk_count': medium_risk_products,
            'low_risk_count': total_products - high_risk_products - medium_risk_products,
            'overall_risk_level': 'high' if high_risk_products > total_products // 3 else 'medium' if medium_risk_products > total_products // 2 else 'low',
            'risk_assessment_date': datetime.now().isoformat()
        }
    
    def generate_competitive_battlecard(self, company_name: str, competitors: List[str]) -> Dict[str, Any]:
        """Generate competitive battlecard for strategic analysis"""
        battlecard = {
            'company_name': company_name,
            'competitors': competitors,
            'generated_date': datetime.now().isoformat(),
            'competitive_analysis': {},
            'market_positioning': {},
            'strengths_weaknesses': {},
            'strategic_recommendations': {}
        }
        
        # This would integrate with the competitive analyzer for comprehensive insights
        # For now, return a structured template
        
        return battlecard
    
    def export_analysis_results(self, analysis_results: Dict[str, Any], format: str = 'json') -> str:
        """Export analysis results in specified format"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        if format.lower() == 'json':
            filename = f'enterprise_software_analysis_{timestamp}.json'
            with open(filename, 'w') as f:
                json.dump(analysis_results, f, indent=2)
            return filename
        
        elif format.lower() == 'csv':
            # Convert to DataFrame and export
            filename = f'enterprise_software_analysis_{timestamp}.csv'
            # Implementation would convert nested JSON to CSV format
            return filename
        
        else:
            raise ValueError(f"Unsupported export format: {format}")


class MetricsTracker:
    """Track and analyze metrics over time"""
    
    def __init__(self):
        self.metrics_history = {}
    
    def track_metric(self, metric_name: str, value: Any, timestamp: Optional[datetime] = None):
        """Track a metric value over time"""
        if timestamp is None:
            timestamp = datetime.now()
        
        if metric_name not in self.metrics_history:
            self.metrics_history[metric_name] = []
        
        self.metrics_history[metric_name].append({
            'value': value,
            'timestamp': timestamp.isoformat()
        })
    
    def get_metric_trend(self, metric_name: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get metric trend over specified number of days"""
        if metric_name not in self.metrics_history:
            return []
        
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_metrics = [
            m for m in self.metrics_history[metric_name]
            if datetime.fromisoformat(m['timestamp']) > cutoff_date
        ]
        
        return recent_metrics


class ChangeDetectionEngine:
    """Detect changes in software documentation and APIs"""
    
    def __init__(self):
        self.change_history = {}
    
    def detect_api_changes(self, old_spec: Dict, new_spec: Dict) -> Dict[str, List]:
        """Detect API changes between specifications"""
        changes = {
            'breaking_changes': [],
            'new_endpoints': [],
            'deprecated_endpoints': [],
            'parameter_changes': [],
            'response_changes': []
        }
        
        # Implementation would compare OpenAPI specifications
        # For now, return empty structure
        
        return changes
    
    def detect_feature_changes(self, old_release_notes: str, new_release_notes: str) -> Dict[str, List]:
        """Detect feature changes from release notes"""
        changes = {
            'new_features': [],
            'enhanced_features': [],
            'removed_features': [],
            'feature_deprecations': []
        }
        
        # Implementation would parse and compare release notes
        # For now, return empty structure
        
        return changes


class CompetitiveAnalyzer:
    """Analyze competitive positioning and market dynamics"""
    
    def __init__(self):
        self.competitive_data = {}
    
    def analyze_category_positioning(self, category: str, product_analyses: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze competitive positioning within a category"""
        if not product_analyses:
            return {}
        
        # Calculate competitive positioning metrics
        successful_analyses = {k: v for k, v in product_analyses.items() if 'error' not in v}
        
        if not successful_analyses:
            return {'error': 'No successful analyses for competitive positioning'}
        
        # Sort products by market position score
        sorted_products = sorted(
            successful_analyses.items(),
            key=lambda x: x[1]['market_position']['market_position_score'],
            reverse=True
        )
        
        return {
            'category': category,
            'total_products': len(successful_analyses),
            'market_leaders': [p[0] for p in sorted_products[:3]],
            'market_challengers': [p[0] for p in sorted_products[3:6] if len(sorted_products) > 3],
            'market_followers': [p[0] for p in sorted_products[6:] if len(sorted_products) > 6],
            'competitive_analysis_date': datetime.now().isoformat()
        }
    
    def analyze_feature_parity(self, product_a: str, product_b: str) -> Dict[str, List]:
        """Analyze feature parity between competing products"""
        comparison = {
            'product_a_advantages': [],
            'product_b_advantages': [],
            'shared_features': [],
            'differentiating_features': []
        }
        
        # Implementation would compare feature sets
        # For now, return empty structure
        
        return comparison


# Example usage and testing
if __name__ == "__main__":
    # Initialize analyzer
    analyzer = EnterpriseSoftwareAnalyzer()
    
    # Analyze a specific category
    crm_analysis = analyzer.analyze_software_category("customer_relationship_management")
    
    # Export results
    filename = analyzer.export_analysis_results(crm_analysis, 'json')
    print(f"Analysis exported to: {filename}")
    
    # Generate competitive battlecard
    battlecard = analyzer.generate_competitive_battlecard("HubSpot", ["Salesforce", "Microsoft_Dynamics"])
    print("Competitive battlecard generated successfully") 