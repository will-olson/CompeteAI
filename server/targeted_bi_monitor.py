#!/usr/bin/env python3
"""
Targeted BI Competitive Monitor
- Uses curated doc roots per company where possible
- Deeper doc discovery (limited) + RSS discovery
- Stores to SQLite and generates AI reports + consolidated matrix
"""

import re
import json
import time
import hashlib
import requests
from datetime import datetime
from typing import Dict, List, Tuple
from urllib.parse import urljoin, urlparse
from pathlib import Path
from bs4 import BeautifulSoup
import feedparser
import shutil
import sys

from store_scrape_to_sqlite import (
    BASE_URL,
    OUTPUT_DIR as DEFAULT_OUTPUT_DIR,
    ensure_dirs,
    init_db,
    insert_item,
)
import rss_batch_scrape_and_insights as rssmod
from rss_batch_scrape_and_insights import (
    summarize_rss_items,
    write_insights_markdown as write_rss_insights_md,
    ai_analyze_company_rss,
    write_ai_summary_markdown as write_rss_ai_md,
    ensure_rss_meta_table,
    store_rss_meta,
    find_existing_item,
)
import unified_competitive_monitor as umod
from unified_competitive_monitor import write_docs_ai_md, ai_analyze_docs
from competitor_targeting import COMPETITORS
from coverage_gap_resolver import CoverageGapResolver

# Determine disk health and set dry-run if low space
usage = shutil.disk_usage("/")
LOW_SPACE = usage.free < 100 * 1024 * 1024  # <100MB free
DRY_RUN = LOW_SPACE
if DRY_RUN:
    print("⚠️ Low disk space detected — running in DRY RUN mode (no file/DB writes).", file=sys.stderr)

# Route outputs to a directory in the user's home for more available space
HOME_OUTPUT_DIR = Path.home() / 'StockAI_tmp_output' / 'scraped_markdown'
try:
    HOME_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    # Monkey-patch destination dirs in imported modules
    rssmod.OUTPUT_DIR = HOME_OUTPUT_DIR
    umod.OUTPUT_DIR = HOME_OUTPUT_DIR
except OSError:
    DRY_RUN = True

HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}

KEYWORD_ALLOW = re.compile(r"\b(api|endpoint|authentication|oauth|token|webhook|sdk|client|reference|limit|quota|pricing|rate|integration|connector|etl|warehouse)\b", re.I)
MAX_DOC_PAGES_PER_COMPANY = 60
MAX_DEPTH = 2
SITEMAP_LIMIT = 150


def same_site(base: str, url: str) -> bool:
    try:
        b = urlparse(base)
        u = urlparse(url)
        return (u.netloc or '').endswith(b.netloc.split(':')[0])
    except Exception:
        return False


def fetch(url: str, timeout: int = 12) -> str:
    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout)
        if r.status_code == 200 and 'text/html' in r.headers.get('Content-Type',''):
            return r.text
    except Exception:
        pass
    return ""


def fetch_bytes(url: str, timeout: int = 10) -> bytes:
    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout)
        if r.status_code == 200:
            return r.content
    except Exception:
        pass
    return b""


def extract_links(base: str, html: str) -> List[str]:
    soup = BeautifulSoup(html, 'html.parser')
    links: List[str] = []
    for a in soup.find_all('a', href=True):
        u = urljoin(base, a['href'])
        if same_site(base, u):
            links.append(u)
    return list(dict.fromkeys(links))


def score_page_text(text: str) -> int:
    return len(KEYWORD_ALLOW.findall(text))


def discover_from_sitemap(domain: str, roots: List[Dict]) -> List[Dict]:
    """Enhanced sitemap discovery with technical content prioritization - Phase 2.1 implementation"""
    candidates = [urljoin(domain, 'sitemap.xml'), urljoin(domain, 'sitemap_index.xml')]
    urls: List[Dict] = []
    
    for sm in candidates:
        xml = fetch_bytes(sm, timeout=8)
        if not xml:
            continue
        try:
            soup = BeautifulSoup(xml, 'xml')
            for loc in soup.find_all('loc'):
                u = loc.get_text(strip=True)
                if u and same_site(domain, u):
                    # Score URL for technical relevance
                    technical_score = score_url_technical_relevance(u)
                    urls.append({
                        'url': u,
                        'technical_score': technical_score,
                        'source': 'sitemap'
                    })
        except Exception:
            continue
    
    # Filter to doc-like URLs and roots domain
    filtered = []
    for url_info in urls:
        u = url_info['url']
        if any(k in u.lower() for k in ['doc', 'help', 'developer', 'developers', 'reference', 'api', 'learn']):
            filtered.append(url_info)
    
    # Ensure we include roots as seeds with high priority
    for r in roots:
        if isinstance(r, dict) and 'url' in r:
            root_url = r['url']
            if root_url not in [url_info['url'] for url_info in filtered]:
                filtered.append({
                    'url': root_url,
                    'technical_score': r.get('technical_score', 1.0),  # High priority for seed roots
                    'source': r.get('source', 'seed_root')
                })
    
    # Sort by technical relevance score
    filtered.sort(key=lambda x: x['technical_score'], reverse=True)
    
    return filtered[:SITEMAP_LIMIT]

def score_url_technical_relevance(url: str) -> float:
    """Score URL for technical relevance - Phase 2.3 implementation"""
    try:
        score = 0.0
        
        # High-value technical paths
        high_value_patterns = [
            '/api/', '/docs/', '/developers/', '/reference/', '/sdk/',
            '/integration/', '/webhook/', '/authentication/', '/rate-limit/'
        ]
        
        for pattern in high_value_patterns:
            if pattern in url.lower():
                score += 0.3
                break
        
        # Technical file extensions
        tech_extensions = ['.json', '.yaml', '.yml', '.md', '.pdf']
        for ext in tech_extensions:
            if ext in url.lower():
                score += 0.2
                break
        
        # Version patterns (v1, v2, etc.)
        if re.search(r'/v\d+/', url.lower()):
            score += 0.15
        
        # API version patterns
        if re.search(r'/api/v\d+/', url.lower()):
            score += 0.25
        
        # Documentation patterns
        doc_patterns = ['/guide/', '/tutorial/', '/example/', '/sample/']
        for pattern in doc_patterns:
            if pattern in url.lower():
                score += 0.1
        
        return min(1.0, score)
        
    except Exception:
        return 0.0

def extract_technical_links(base_url: str, html_content: str) -> List[Dict]:
    """Extract and score links for technical relevance - Phase 2.2 implementation"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        links: List[Dict] = []
        
        for a in soup.find_all('a', href=True):
            u = urljoin(base_url, a['href'])
            if same_site(base_url, u):
                # Score link for technical relevance
                technical_score = score_link_technical_relevance(a, u)
                
                link_info = {
                    'url': u,
                    'text': a.get_text(strip=True),
                    'title': a.get('title', ''),
                    'technical_score': technical_score,
                    'relevance_category': categorize_link_relevance(technical_score),
                    'technical_indicators': extract_link_technical_indicators(a, u)
                }
                links.append(link_info)
        
        # Remove duplicates and sort by technical relevance
        unique_links = {}
        for link in links:
            if link['url'] not in unique_links or link['technical_score'] > unique_links[link['url']]['technical_score']:
                unique_links[link['url']] = link
        
        sorted_links = sorted(unique_links.values(), key=lambda x: x['technical_score'], reverse=True)
        return sorted_links
        
    except Exception as e:
        print(f"Error extracting technical links: {e}")
        return []

def score_link_technical_relevance(link_element, url: str) -> float:
    """Score individual link for technical relevance"""
    try:
        score = 0.0
        link_text = link_element.get_text(strip=True).lower()
        url_lower = url.lower()
        
        # Technical keywords in link text
        technical_keywords = [
            'api', 'sdk', 'docs', 'developers', 'reference', 'guide',
            'tutorial', 'example', 'sample', 'integration', 'webhook',
            'authentication', 'rate-limit', 'endpoint', 'swagger', 'openapi'
        ]
        
        for keyword in technical_keywords:
            if keyword in link_text:
                score += 0.1
        
        # Technical URL patterns
        if any(pattern in url_lower for pattern in ['/api/', '/docs/', '/developers/', '/reference/']):
            score += 0.3
        
        # Technical file extensions
        if any(ext in url_lower for ext in ['.json', '.yaml', '.yml', '.md']):
            score += 0.2
        
        # Version patterns
        if re.search(r'/v\d+/', url_lower):
            score += 0.15
        
        # API endpoints
        if re.search(r'/api/v\d+/', url_lower):
            score += 0.25
        
        return min(1.0, score)
        
    except Exception:
        return 0.0

def categorize_link_relevance(technical_score: float) -> str:
    """Categorize link by technical relevance"""
    if technical_score >= 0.7:
        return 'high_technical'
    elif technical_score >= 0.4:
        return 'medium_technical'
    elif technical_score >= 0.1:
        return 'low_technical'
    else:
        return 'non_technical'

def extract_link_technical_indicators(link_element, url: str) -> List[str]:
    """Extract technical indicators from link"""
    indicators = []
    link_text = link_element.get_text(strip=True).lower()
    url_lower = url.lower()
    
    # Check for technical patterns
    if '/api/' in url_lower:
        indicators.append('api_path')
    if '/docs/' in url_lower:
        indicators.append('documentation')
    if '/developers/' in url_lower:
        indicators.append('developer_resources')
    if any(ext in url_lower for ext in ['.json', '.yaml', '.yml']):
        indicators.append('structured_data')
    if 'sdk' in link_text:
        indicators.append('sdk_related')
    if 'api' in link_text:
        indicators.append('api_related')
    
    return indicators

def crawl_docs_enhanced(company: str, roots: List[Dict], cap: int = MAX_DOC_PAGES_PER_COMPANY, max_depth: int = MAX_DEPTH) -> List[Dict]:
    """Enhanced document crawling with technical relevance prioritization - Phase 2 implementation"""
    seen: set = set()
    results: List[Dict] = []
    queue: List[Tuple[Dict, int]] = []
    
    # Initialize queue with seed roots
    for root_info in roots:
        queue.append((root_info, 0))
        seen.add(root_info['url'])
    
    while queue and len(results) < cap:
        # Sort queue by technical relevance score for intelligent crawling
        queue.sort(key=lambda x: x[0]['technical_score'], reverse=True)
        url_info, depth = queue.pop(0)
        url = url_info['url']
        
        html = fetch(url)
        if not html:
            continue
        
        soup = BeautifulSoup(html, 'html.parser')
        title = soup.find('title').get_text() if soup.find('title') else url
        main = soup.find('main') or soup.find('article') or soup.find('body')
        text = main.get_text(' ', strip=True) if main else soup.get_text(' ', strip=True)
        
        # Enhanced content scoring
        score = score_page_text(text)
        technical_relevance = calculate_technical_relevance(text, company)
        
        if score > 0 or technical_relevance > 0.3:
            results.append({
                'company': company,
                'title': title,
                'content': text,
                'url': url,
                'score': score,
                'technical_relevance': technical_relevance,
                'technical_score': url_info.get('technical_score', 0.0),
                'source': url_info.get('source', 'unknown'),
                'depth': depth
            })
        
        # Intelligent link discovery for next level
        if depth < max_depth:
            technical_links = extract_technical_links(url, html)
            
            # Add high-scoring technical links to queue
            for link_info in technical_links:
                if (link_info['url'] not in seen and 
                    link_info['technical_score'] > 0.3 and  # Only follow technically relevant links
                    any(link_info['url'].startswith(r['url']) for r in roots)):
                    
                    seen.add(link_info['url'])
                    queue.append((link_info, depth + 1))
    
    # Sort results by combined score (content score + technical relevance)
    results.sort(key=lambda x: (x['score'] + x['technical_relevance'] * 2), reverse=True)
    return results[:cap]

def calculate_technical_relevance(text: str, company: str) -> float:
    """Calculate technical relevance score for content - Phase 2.3 implementation"""
    try:
        text_lower = text.lower()
        score = 0.0
        
        # Technical terminology density
        technical_terms = [
            'api', 'endpoint', 'authentication', 'sdk', 'deployment', 'configuration',
            'integration', 'webhook', 'rate limit', 'quota', 'oauth', 'token',
            'swagger', 'openapi', 'rest', 'graphql', 'http', 'request', 'response'
        ]
        
        term_count = sum(1 for term in technical_terms if term in text_lower)
        score += min(0.4, term_count * 0.05)
        
        # Code block presence
        if '```' in text or '<code>' in text:
            score += 0.2
        
        # URL patterns (API endpoints, documentation links)
        url_patterns = [r'https?://[^\s]+\.json', r'https?://[^\s]+\.yaml', r'https?://[^\s]+\.yml']
        for pattern in url_patterns:
            if re.search(pattern, text):
                score += 0.15
        
        # HTTP methods
        http_methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        method_count = sum(1 for method in http_methods if method in text)
        score += min(0.15, method_count * 0.03)
        
        # Company-specific technical keywords
        company_keywords = {
            'snowflake': ['snowpark', 'cortex', 'warehouse', 'data cloud', 'sql'],
            'databricks': ['notebook', 'workspace', 'unity catalog', 'delta lake', 'mlflow'],
            'powerbi': ['power query', 'dax', 'm language', 'gateway', 'workspace'],
            'tableau': ['tableau prep', 'tableau server', 'tableau online', 'vizql', 'hyper'],
            'looker': ['lookml', 'explore', 'dashboard', 'block', 'bigquery'],
            'qlik': ['qlikview', 'qliksense', 'script', 'load script', 'qlik engine']
        }
        
        company_lower = company.lower()
        for comp, keywords in company_keywords.items():
            if comp in company_lower:
                for keyword in keywords:
                    if keyword.lower() in text_lower:
                        score += 0.1
        
        return min(1.0, score)
        
    except Exception:
        return 0.0

def discover_rss_feeds_enhanced(domain: str) -> List[Dict]:
    """Enhanced RSS feed discovery with technical relevance scoring"""
    seeds = [domain, urljoin(domain, 'blog/'), urljoin(domain, 'news/'), urljoin(domain, 'press/'), urljoin(domain, 'updates/')]
    candidates: List[Dict] = []
    
    # Parse HTML for rel=alternate
    for s in seeds[:2]:
        html = fetch(s, timeout=6)
        if not html:
            continue
        soup = BeautifulSoup(html, 'html.parser')
        for link in soup.find_all('link', rel=lambda x: x and 'alternate' in x):
            t = (link.get('type') or '').lower()
            if 'rss' in t or 'atom' in t or 'xml' in t:
                href = link.get('href')
                if href:
                    url = urljoin(s, href)
                    technical_score = score_url_technical_relevance(url)
                    candidates.append({
                        'url': url,
                        'type': 'html_link',
                        'technical_score': technical_score
                    })
    
    # Common direct feed paths
    common_paths = ['feed', 'rss', 'rss.xml', 'atom.xml', 'index.xml', 'blog/rss', 'blog/feed', 'news/rss', 'news/feed']
    for p in common_paths:
        url = urljoin(domain, p)
        technical_score = score_url_technical_relevance(url)
        candidates.append({
            'url': url,
            'type': 'common_path',
            'technical_score': technical_score
        })
    
    # Dedup and validate
    valid: List[Dict] = []
    seen_urls = set()
    
    for candidate in candidates:
        if candidate['url'] in seen_urls:
            continue
        
        seen_urls.add(candidate['url'])
        content = fetch_bytes(candidate['url'], timeout=6)
        if not content:
            continue
        
        try:
            parsed = feedparser.parse(content)
            if getattr(parsed, 'entries', None):
                valid.append(candidate)
        except Exception:
            continue
    
    # Sort by technical relevance and return top candidates
    valid.sort(key=lambda x: x['technical_score'], reverse=True)
    return valid[:8]


def fallback_scrape_company_rss(company: str, feed_url: str) -> Dict:
    content = fetch_bytes(feed_url, timeout=8)
    if not content:
        return {'company': company, 'scraped_at': datetime.now().isoformat(), 'categories': {'rss': {'items': []}}}
    parsed = feedparser.parse(content)
    items: List[Dict] = []
    for e in parsed.entries[:50]:
        items.append({
            'title': getattr(e, 'title', ''),
            'url': getattr(e, 'link', ''),
            'content': getattr(e, 'summary', '') or getattr(e, 'description', ''),
            'author': getattr(e, 'author', ''),
            'published': getattr(e, 'published', '') or getattr(e, 'updated', ''),
        })
    return {
        'company': company,
        'scraped_at': datetime.now().isoformat(),
        'categories': {
            'rss': {
                'items': items
            }
        }
    }


def run_company_with_fallback(name: str, domain: str, roots: List[str], conn) -> Dict:
    """Run company monitoring with automatic fallback for coverage gaps"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Convert roots to new format for enhanced crawling
    enhanced_roots = []
    for root in roots:
        enhanced_roots.append({
            'url': root,
            'technical_score': 1.0,  # High priority for seed roots
            'source': 'seed_root'
        })
    
    # RSS (enhanced discovery + feedparser)
    feeds = discover_rss_feeds_enhanced(domain)
    rss_items: List[Dict] = []
    seen = set()
    
    for f in feeds:
        r = fallback_scrape_company_rss(name, f['url'])
        rss = (r.get('categories', {}) or {}).get('rss', {})
        items = rss.get('items', []) or []
        
        for item in items:
            u = item.get('url') or ''
            if u in seen:
                continue
            seen.add(u)
            
            if not DRY_RUN and conn is not None:
                try:
                    existing_id = find_existing_item(conn, name, 'rss', u or f['url'])
                    if not existing_id:
                        new_id = insert_item(conn, name, 'rss', u or f['url'], {
                            'text_content': (item.get('title','') + '\n\n' + (item.get('content','') or ''))
                        }, 0.0, 1.0, r.get('scraped_at', datetime.now().isoformat()))
                        store_rss_meta(conn, new_id, item.get('author',''), item.get('published',''), f['url'])
                except OSError:
                    pass
            
            rss_items.append(item)
    
    rss_summary = summarize_rss_items(rss_items)
    if not DRY_RUN:
        try:
            write_rss_insights_md(name, feeds, rss_items, rss_summary, timestamp)
            rss_ai = ai_analyze_company_rss(name, rss_items)
            write_rss_ai_md(name, rss_ai, timestamp)
        except OSError:
            pass

    # DOCS (enhanced crawling with technical relevance prioritization)
    sitemap_urls = discover_from_sitemap(domain, enhanced_roots)
    
    # Ensure sitemap_urls is a list of dictionaries
    if not isinstance(sitemap_urls, list):
        sitemap_urls = []
    
    # Merge seed roots with sitemap URLs, prioritizing by technical score
    all_roots = enhanced_roots + sitemap_urls
    
    # Remove duplicates while preserving highest technical scores
    unique_roots = {}
    for root_info in all_roots:
        if isinstance(root_info, dict) and 'url' in root_info:
            url = root_info['url']
            if isinstance(url, str):
                current_score = unique_roots.get(url, {}).get('technical_score', 0)
                new_score = root_info.get('technical_score', 0)
                if url not in unique_roots or new_score > current_score:
                    unique_roots[url] = root_info
    
    # Sort by technical score and take top candidates
    doc_seed_roots = sorted(unique_roots.values(), key=lambda x: x.get('technical_score', 0), reverse=True)[:15]
    
    # Convert to the format expected by crawl_docs_enhanced
    doc_seed_roots_formatted = []
    for root_info in doc_seed_roots:
        if isinstance(root_info, dict) and 'url' in root_info:
            doc_seed_roots_formatted.append({
                'url': root_info['url'],
                'technical_score': root_info.get('technical_score', 0.0),
                'source': root_info.get('source', 'unknown')
            })
    
    doc_pages = crawl_docs_enhanced(name, doc_seed_roots_formatted, MAX_DOC_PAGES_PER_COMPANY, MAX_DEPTH)
    
    # Check if we need fallback discovery due to low coverage
    if len(doc_pages) < 5:  # Threshold for considering coverage insufficient
        print(f"   ⚠️ Low coverage detected ({len(doc_pages)} pages) - attempting fallback discovery...")
        
        # Use coverage gap resolver to find fallback URLs
        resolver = CoverageGapResolver()
        investigation = resolver.investigate_coverage_gaps(name, domain, roots)
        
        # Test fallback URLs and find accessible ones
        fallback_urls = investigation['fallback_urls']
        tested_fallbacks = resolver.test_fallback_urls(fallback_urls)
        
        # Use high-priority accessible fallbacks
        accessible_fallbacks = [
            url_info for url_info in tested_fallbacks 
            if url_info.get('accessible', False) and url_info.get('priority') == 'high'
        ]
        
        if accessible_fallbacks:
            print(f"   🔍 Found {len(accessible_fallbacks)} accessible fallback URLs")
            
            # Convert fallbacks to enhanced root format
            fallback_roots = []
            for fallback in accessible_fallbacks[:5]:  # Limit to top 5
                fallback_roots.append({
                    'url': fallback['url'],
                    'technical_score': 0.8,  # High priority for fallbacks
                    'source': f"fallback_{fallback['type']}"
                })
            
            # Try crawling with fallback roots
            if fallback_roots:
                print(f"   🚀 Attempting fallback crawling with {len(fallback_roots)} URLs...")
                fallback_pages = crawl_docs_enhanced(name, fallback_roots, MAX_DOC_PAGES_PER_COMPANY, MAX_DEPTH)
                
                if len(fallback_pages) > len(doc_pages):
                    print(f"   ✅ Fallback successful: {len(fallback_pages)} pages vs {len(doc_pages)} original")
                    doc_pages = fallback_pages
                    # Update source information
                    for page in doc_pages:
                        page['source'] = 'fallback_discovery'
                else:
                    print(f"   ❌ Fallback did not improve coverage")
        
        # Save investigation report
        if not DRY_RUN:
            try:
                report = resolver.generate_coverage_report(name, investigation)
                report_filename = f"coverage_investigation_{name.lower().replace(' ', '_')}_{timestamp}.md"
                report_path = HOME_OUTPUT_DIR / report_filename
                report_path.write_text(report, encoding='utf-8')
                print(f"   📄 Coverage investigation saved: {report_filename}")
            except Exception as e:
                print(f"   ⚠️ Could not save coverage investigation: {e}")
    
    if not DRY_RUN and conn is not None:
        for p in doc_pages:
            try:
                existing_id = find_existing_item(conn, name, 'docs', p['url'])
                if not existing_id:
                    insert_item(conn, name, 'docs', p['url'], {'text_content': p.get('content','')}, 0.0, 1.0, datetime.now().isoformat())
            except OSError:
                pass
        
        try:
            docs_ai = ai_analyze_docs(name, doc_pages)
            write_docs_ai_md(name, docs_ai, timestamp)
        except OSError:
            pass

    if DRY_RUN:
        print(f"   RSS items: {len(rss_items)} | Top titles: " + "; ".join([i.get('title','')[:60] for i in rss_items[:5]]))
        print(f"   Docs pages captured (enhanced + fallback): {len(doc_pages)} | Top: " + "; ".join([p.get('title','')[:60] for p in doc_pages[:5]]))
        
        # Show technical relevance distribution
        if doc_pages:
            high_tech = len([p for p in doc_pages if p.get('technical_relevance', 0) > 0.5])
            med_tech = len([p for p in doc_pages if 0.2 < p.get('technical_relevance', 0) <= 0.5])
            low_tech = len([p for p in doc_pages if p.get('technical_relevance', 0) <= 0.2])
            print(f"   Technical relevance: High({high_tech}) Medium({med_tech}) Low({low_tech})")

    return {
        'rss_count': len(rss_items),
        'docs_count': len(doc_pages),
        'enhanced_crawling': True,
        'fallback_discovery_used': len(doc_pages) > 0 and any(p.get('source') == 'fallback_discovery' for p in doc_pages),
        'technical_relevance_stats': {
            'high_tech': len([p for p in doc_pages if p.get('technical_relevance', 0) > 0.5]),
            'medium_tech': len([p for p in doc_pages if 0.2 < p.get('technical_relevance', 0) <= 0.5]),
            'low_tech': len([p for p in doc_pages if p.get('technical_relevance', 0) <= 0.2])
        } if doc_pages else {}
    }


def main():
    try:
        ensure_dirs()
        conn = init_db()
        ensure_rss_meta_table(conn)
    except OSError:
        conn = None

    consolidated: Dict[str, Dict] = {}
    for comp in COMPETITORS:
        name = comp['name']
        domain = comp['domain']
        docs_roots = comp.get('docs', [])
        print(f"\n▶️ Running targeted monitoring for {name}")
        consolidated[name] = run_company_with_fallback(name, domain, docs_roots, conn)

    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    if not DRY_RUN:
        try:
            report = HOME_OUTPUT_DIR / f"CROSS_COMPETITIVE_MATRIX_{ts}.md"
            lines: List[str] = ["# Cross-Competitive Matrix", f"Generated: {ts}", ""]
            lines += ["| Company | Docs pages | RSS items |", "|---|---:|---:|"]
            for name, stats in consolidated.items():
                lines.append(f"| {name} | {stats.get('docs_count',0)} | {stats.get('rss_count',0)} |")
            report.write_text("\n".join(lines), encoding='utf-8')
            print(f"\n📄 Matrix: {report}")
        except OSError:
            pass
    else:
        print("\nMatrix (dry-run):")
        for name, stats in consolidated.items():
            print(f"- {name}: docs={stats.get('docs_count',0)}, rss={stats.get('rss_count',0)}")


if __name__ == '__main__':
    main()
