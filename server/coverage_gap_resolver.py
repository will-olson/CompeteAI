#!/usr/bin/env python3
"""
Coverage Gap Resolver - Phase 3 Implementation
Investigates and fixes coverage gaps for companies with 0 scraped items
"""

import requests
import re
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Any
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CoverageGapResolver:
    """Resolves coverage gaps by investigating failed companies and implementing fallback discovery"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Common documentation paths to try
        self.common_doc_paths = [
            '/docs', '/documentation', '/help', '/support', '/developers',
            '/api', '/reference', '/guides', '/tutorials', '/examples',
            '/downloads', '/sdk', '/client-libraries', '/integrations'
        ]
        
        # Common RSS feed paths
        self.common_rss_paths = [
            '/feed', '/rss', '/rss.xml', '/atom.xml', '/blog/feed',
            '/news/feed', '/updates/feed', '/blog/rss', '/news/rss'
        ]
        
        # Company-specific fallback URLs
        self.company_fallbacks = {
            'tableau': {
                'domain': 'https://www.tableau.com',
                'alternative_docs': [
                    'https://help.tableau.com',
                    'https://www.tableau.com/developer',
                    'https://www.tableau.com/support'
                ],
                'alternative_rss': [
                    'https://www.tableau.com/blog/feed',
                    'https://www.tableau.com/news/feed'
                ]
            },
            'oracle': {
                'domain': 'https://www.oracle.com',
                'alternative_docs': [
                    'https://docs.oracle.com',
                    'https://www.oracle.com/technetwork',
                    'https://www.oracle.com/webfolder/technetwork'
                ],
                'alternative_rss': [
                    'https://blogs.oracle.com/feed',
                    'https://www.oracle.com/news/feed'
                ]
            },
            'sap': {
                'domain': 'https://www.sap.com',
                'alternative_docs': [
                    'https://help.sap.com',
                    'https://developers.sap.com',
                    'https://www.sap.com/developer'
                ],
                'alternative_rss': [
                    'https://blogs.sap.com/feed',
                    'https://news.sap.com/feed'
                ]
            },
            'microstrategy': {
                'domain': 'https://www.microstrategy.com',
                'alternative_docs': [
                    'https://www2.microstrategy.com/producthelp',
                    'https://www.microstrategy.com/us/support',
                    'https://www.microstrategy.com/us/developers'
                ],
                'alternative_rss': [
                    'https://www.microstrategy.com/us/news/feed',
                    'https://www.microstrategy.com/us/blog/feed'
                ]
            },
            'ibm': {
                'domain': 'https://www.ibm.com',
                'alternative_docs': [
                    'https://www.ibm.com/docs',
                    'https://www.ibm.com/developer',
                    'https://www.ibm.com/support'
                ],
                'alternative_rss': [
                    'https://www.ibm.com/blogs/feed',
                    'https://www.ibm.com/news/feed'
                ]
            }
        }
    
    def investigate_coverage_gaps(self, company_name: str, domain: str, original_roots: List[str]) -> Dict[str, Any]:
        """Investigate why a company has 0 docs/RSS and suggest fixes"""
        logger.info(f"Investigating coverage gaps for {company_name}")
        
        investigation = {
            'company': company_name,
            'domain': domain,
            'original_roots': original_roots,
            'url_accessibility': {},
            'redirect_chains': {},
            'robots_txt': {},
            'suggested_fixes': [],
            'fallback_urls': [],
            'investigation_timestamp': time.time()
        }
        
        # Test URL accessibility
        investigation['url_accessibility'] = self._test_url_accessibility(domain, original_roots)
        
        # Follow redirect chains
        investigation['redirect_chains'] = self._follow_redirects(domain, original_roots)
        
        # Check robots.txt
        investigation['robots_txt'] = self._check_robots_txt(domain)
        
        # Generate suggested fixes
        investigation['suggested_fixes'] = self._suggest_fixes(company_name, domain, investigation)
        
        # Find fallback URLs
        investigation['fallback_urls'] = self._find_fallback_urls(company_name, domain)
        
        return investigation
    
    def _test_url_accessibility(self, domain: str, roots: List[str]) -> Dict[str, Any]:
        """Test if URLs are accessible and return status codes"""
        accessibility = {}
        
        # Test domain root
        try:
            response = self.session.get(domain, timeout=10, allow_redirects=False)
            accessibility['domain_root'] = {
                'status_code': response.status_code,
                'accessible': response.status_code < 400,
                'content_type': response.headers.get('content-type', ''),
                'redirects_to': response.headers.get('location', '')
            }
        except Exception as e:
            accessibility['domain_root'] = {
                'status_code': 'error',
                'accessible': False,
                'error': str(e)
            }
        
        # Test original roots
        for root in roots:
            try:
                response = self.session.get(root, timeout=10, allow_redirects=False)
                accessibility[root] = {
                    'status_code': response.status_code,
                    'accessible': response.status_code < 400,
                    'content_type': response.headers.get('content-type', ''),
                    'redirects_to': response.headers.get('location', '')
                }
            except Exception as e:
                accessibility[root] = {
                    'status_code': 'error',
                    'accessible': False,
                    'error': str(e)
                }
        
        return accessibility
    
    def _follow_redirects(self, domain: str, roots: List[str]) -> Dict[str, Any]:
        """Follow redirect chains to find actual endpoints"""
        redirects = {}
        
        # Follow domain redirects
        try:
            response = self.session.get(domain, timeout=10, allow_redirects=True)
            redirects['domain_final'] = {
                'final_url': response.url,
                'redirect_count': len(response.history),
                'redirect_chain': [r.url for r in response.history] + [response.url]
            }
        except Exception as e:
            redirects['domain_final'] = {
                'error': str(e)
            }
        
        # Follow root redirects
        for root in roots:
            try:
                response = self.session.get(root, timeout=10, allow_redirects=True)
                redirects[root] = {
                    'final_url': response.url,
                    'redirect_count': len(response.history),
                    'redirect_chain': [r.url for r in response.history] + [response.url]
                }
            except Exception as e:
                redirects[root] = {
                    'error': str(e)
                }
        
        return redirects
    
    def _check_robots_txt(self, domain: str) -> Dict[str, Any]:
        """Check robots.txt for blocking issues"""
        robots_info = {}
        
        try:
            robots_url = urljoin(domain, '/robots.txt')
            response = self.session.get(robots_url, timeout=10)
            
            if response.status_code == 200:
                robots_content = response.text
                robots_info['accessible'] = True
                robots_info['content_length'] = len(robots_content)
                robots_info['has_user_agent'] = 'User-agent:' in robots_content
                robots_info['has_disallow'] = 'Disallow:' in robots_content
                robots_info['has_allow'] = 'Allow:' in robots_content
                
                # Check for specific blocking patterns
                disallow_patterns = re.findall(r'Disallow:\s*(.+)', robots_content)
                robots_info['disallow_patterns'] = disallow_patterns
                
                # Check if docs paths are blocked
                docs_blocked = any('docs' in pattern or 'documentation' in pattern for pattern in disallow_patterns)
                robots_info['docs_blocked'] = docs_blocked
                
            else:
                robots_info['accessible'] = False
                robots_info['status_code'] = response.status_code
                
        except Exception as e:
            robots_info['accessible'] = False
            robots_info['error'] = str(e)
        
        return robots_info
    
    def _suggest_fixes(self, company_name: str, domain: str, investigation: Dict[str, Any]) -> List[str]:
        """Generate suggested fixes based on investigation results"""
        suggestions = []
        
        # Check accessibility issues
        accessibility = investigation.get('url_accessibility', {})
        if not accessibility.get('domain_root', {}).get('accessible', True):
            suggestions.append("Domain root is not accessible - check if company website is down or changed")
        
        # Check redirect issues
        redirects = investigation.get('redirect_chains', {})
        domain_redirects = redirects.get('domain_final', {})
        if domain_redirects.get('redirect_count', 0) > 3:
            suggestions.append("Excessive redirects detected - company may have changed domain structure")
        
        # Check robots.txt blocking
        robots = investigation.get('robots_txt', {})
        if robots.get('docs_blocked', False):
            suggestions.append("Documentation paths are blocked by robots.txt - need to respect crawling policies")
        
        # Check for company-specific fallbacks
        company_lower = company_name.lower()
        if any(comp in company_lower for comp in self.company_fallbacks.keys()):
            suggestions.append("Company-specific fallback URLs available - try alternative documentation sources")
        
        # General suggestions
        if not suggestions:
            suggestions.extend([
                "Try common documentation paths (/docs, /help, /developers)",
                "Check for sitemap.xml at domain root",
                "Look for RSS feeds in HTML head section",
                "Try company-specific alternative domains",
                "Check if company has moved documentation to external platforms"
            ])
        
        return suggestions
    
    def _find_fallback_urls(self, company_name: str, domain: str) -> List[Dict[str, Any]]:
        """Find fallback URLs using alternative discovery methods"""
        fallback_urls = []
        company_lower = company_name.lower()
        
        # Company-specific fallbacks
        for comp, fallback_info in self.company_fallbacks.items():
            if comp in company_lower:
                # Add alternative documentation URLs
                for doc_url in fallback_info['alternative_docs']:
                    fallback_urls.append({
                        'url': doc_url,
                        'type': 'alternative_docs',
                        'source': 'company_specific',
                        'priority': 'high'
                    })
                
                # Add alternative RSS URLs
                for rss_url in fallback_info['alternative_rss']:
                    fallback_urls.append({
                        'url': rss_url,
                        'type': 'alternative_rss',
                        'source': 'company_specific',
                        'priority': 'high'
                    })
        
        # Common path probing
        for path in self.common_doc_paths:
            fallback_url = urljoin(domain, path)
            fallback_urls.append({
                'url': fallback_url,
                'type': 'common_doc_path',
                'source': 'path_probing',
                'priority': 'medium'
            })
        
        # Common RSS path probing
        for path in self.common_rss_paths:
            fallback_url = urljoin(domain, path)
            fallback_urls.append({
                'url': fallback_url,
                'type': 'common_rss_path',
                'source': 'path_probing',
                'priority': 'medium'
            })
        
        # Sitemap discovery
        sitemap_urls = [
            urljoin(domain, 'sitemap.xml'),
            urljoin(domain, 'sitemap_index.xml'),
            urljoin(domain, 'sitemap/sitemap.xml')
        ]
        
        for sitemap_url in sitemap_urls:
            fallback_urls.append({
                'url': sitemap_url,
                'type': 'sitemap',
                'source': 'sitemap_discovery',
                'priority': 'high'
            })
        
        return fallback_urls
    
    def test_fallback_urls(self, fallback_urls: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Test fallback URLs to see which ones are accessible"""
        tested_urls = []
        
        for url_info in fallback_urls:
            url = url_info['url']
            try:
                response = self.session.get(url, timeout=10, allow_redirects=False)
                url_info['tested'] = True
                url_info['status_code'] = response.status_code
                url_info['accessible'] = response.status_code < 400
                url_info['content_type'] = response.headers.get('content-type', '')
                
                # Test if it's actually useful content
                if url_info['accessible']:
                    content = response.text[:1000]  # First 1000 chars
                    url_info['has_content'] = len(content) > 100
                    url_info['content_preview'] = content[:200]
                    
                    # Check for technical indicators
                    technical_indicators = ['api', 'documentation', 'docs', 'help', 'guide', 'tutorial']
                    url_info['technical_relevance'] = sum(1 for indicator in technical_indicators if indicator.lower() in content.lower())
                
            except Exception as e:
                url_info['tested'] = True
                url_info['status_code'] = 'error'
                url_info['accessible'] = False
                url_info['error'] = str(e)
            
            tested_urls.append(url_info)
            time.sleep(1)  # Be respectful
        
        return tested_urls
    
    def generate_coverage_report(self, company_name: str, investigation: Dict[str, Any]) -> str:
        """Generate a human-readable coverage report"""
        report = f"# Coverage Gap Investigation Report: {company_name}\n\n"
        report += f"**Generated:** {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(investigation['investigation_timestamp']))}\n\n"
        
        # Summary
        report += "## Summary\n\n"
        report += f"- **Company:** {company_name}\n"
        report += f"- **Domain:** {investigation['domain']}\n"
        report += f"- **Original Roots:** {', '.join(investigation['original_roots'])}\n\n"
        
        # URL Accessibility
        report += "## URL Accessibility\n\n"
        accessibility = investigation['url_accessibility']
        for url, info in accessibility.items():
            status = "✅ Accessible" if info.get('accessible', False) else "❌ Not Accessible"
            report += f"- **{url}:** {status}\n"
            if 'status_code' in info:
                report += f"  - Status Code: {info['status_code']}\n"
            if 'error' in info:
                report += f"  - Error: {info['error']}\n"
        report += "\n"
        
        # Redirect Analysis
        report += "## Redirect Analysis\n\n"
        redirects = investigation['redirect_chains']
        for url, info in redirects.items():
            if 'redirect_count' in info:
                report += f"- **{url}:** {info['redirect_count']} redirects\n"
                if info['redirect_count'] > 0:
                    report += f"  - Final URL: {info['final_url']}\n"
            if 'error' in info:
                report += f"  - Error: {info['error']}\n"
        report += "\n"
        
        # Robots.txt Analysis
        report += "## Robots.txt Analysis\n\n"
        robots = investigation['robots_txt']
        if robots.get('accessible', False):
            report += "✅ Robots.txt is accessible\n"
            report += f"- Content Length: {robots.get('content_length', 0)} characters\n"
            report += f"- Has Disallow Patterns: {'Yes' if robots.get('has_disallow', False) else 'No'}\n"
            if robots.get('docs_blocked', False):
                report += "⚠️ **Documentation paths are blocked by robots.txt**\n"
        else:
            report += "❌ Robots.txt is not accessible\n"
            if 'error' in robots:
                report += f"- Error: {robots['error']}\n"
        report += "\n"
        
        # Suggested Fixes
        report += "## Suggested Fixes\n\n"
        for i, suggestion in enumerate(investigation['suggested_fixes'], 1):
            report += f"{i}. {suggestion}\n"
        report += "\n"
        
        # Fallback URLs
        report += "## Fallback URLs\n\n"
        fallback_urls = investigation['fallback_urls']
        if fallback_urls:
            # Test the fallback URLs
            tested_urls = self.test_fallback_urls(fallback_urls)
            
            # Group by priority
            high_priority = [u for u in tested_urls if u.get('priority') == 'high']
            medium_priority = [u for u in tested_urls if u.get('priority') == 'medium']
            
            if high_priority:
                report += "### High Priority\n\n"
                for url_info in high_priority:
                    status = "✅" if url_info.get('accessible', False) else "❌"
                    report += f"{status} **{url_info['type']}:** {url_info['url']}\n"
                    if url_info.get('accessible', False) and url_info.get('technical_relevance', 0) > 0:
                        report += f"  - Technical Relevance: {url_info['technical_relevance']}/6\n"
                report += "\n"
            
            if medium_priority:
                report += "### Medium Priority\n\n"
                for url_info in medium_priority[:5]:  # Limit to top 5
                    status = "✅" if url_info.get('accessible', False) else "❌"
                    report += f"{status} **{url_info['type']}:** {url_info['url']}\n"
        else:
            report += "No fallback URLs found.\n"
        
        return report

def main():
    """Main function to demonstrate coverage gap resolution"""
    resolver = CoverageGapResolver()
    
    # Example companies with coverage gaps
    companies_to_investigate = [
        {
            'name': 'Tableau',
            'domain': 'https://www.tableau.com',
            'roots': ['https://help.tableau.com']
        },
        {
            'name': 'Oracle',
            'domain': 'https://www.oracle.com',
            'roots': ['https://docs.oracle.com']
        }
    ]
    
    print("🔍 Coverage Gap Resolution - Phase 3 Implementation")
    print("=" * 60)
    
    for company in companies_to_investigate:
        print(f"\n📋 Investigating: {company['name']}")
        
        # Investigate coverage gaps
        investigation = resolver.investigate_coverage_gaps(
            company['name'], 
            company['domain'], 
            company['roots']
        )
        
        # Generate report
        report = resolver.generate_coverage_report(company['name'], investigation)
        
        # Save report
        filename = f"coverage_investigation_{company['name'].lower().replace(' ', '_')}.md"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"📄 Report saved: {filename}")
        
        # Show key findings
        print(f"  - Domain accessible: {investigation['url_accessibility'].get('domain_root', {}).get('accessible', False)}")
        print(f"  - Fallback URLs found: {len(investigation['fallback_urls'])}")
        print(f"  - Suggested fixes: {len(investigation['suggested_fixes'])}")

if __name__ == "__main__":
    main()
