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


def discover_from_sitemap(domain: str, roots: List[str]) -> List[str]:
    candidates = [urljoin(domain, 'sitemap.xml'), urljoin(domain, 'sitemap_index.xml')]
    urls: List[str] = []
    for sm in candidates:
        xml = fetch_bytes(sm, timeout=8)
        if not xml:
            continue
        try:
            soup = BeautifulSoup(xml, 'xml')
            for loc in soup.find_all('loc'):
                u = loc.get_text(strip=True)
                if u and same_site(domain, u):
                    urls.append(u)
        except Exception:
            continue
    urls = list(dict.fromkeys(urls))
    # Filter to doc-like URLs and roots domain
    filtered = [u for u in urls if any(k in u.lower() for k in ['doc', 'help', 'developer', 'developers', 'reference', 'api', 'learn'])]
    # Ensure we include roots as seeds
    for r in roots:
        if r not in filtered:
            filtered.insert(0, r)
    return filtered[:SITEMAP_LIMIT]


def crawl_docs(company: str, roots: List[str], cap: int = MAX_DOC_PAGES_PER_COMPANY, max_depth: int = MAX_DEPTH) -> List[Dict]:
    seen: set = set()
    results: List[Dict] = []
    queue: List[Tuple[str, int]] = []
    for r in roots:
        queue.append((r, 0))
        seen.add(r)
    while queue and len(results) < cap:
        url, depth = queue.pop(0)
        html = fetch(url)
        if not html:
            continue
        soup = BeautifulSoup(html, 'html.parser')
        title = soup.find('title').get_text() if soup.find('title') else url
        main = soup.find('main') or soup.find('article') or soup.find('body')
        text = main.get_text(' ', strip=True) if main else soup.get_text(' ', strip=True)
        score = score_page_text(text)
        if score > 0:
            results.append({
                'company': company,
                'title': title,
                'content': text,
                'url': url,
                'score': score,
            })
        if depth < max_depth:
            for link in extract_links(url, html):
                if link not in seen and any(link.startswith(r) for r in roots):
                    seen.add(link)
                    queue.append((link, depth + 1))
    results.sort(key=lambda x: x.get('score', 0), reverse=True)
    return results[:cap]


def discover_rss_feeds_fast(domain: str) -> List[str]:
    seeds = [domain, urljoin(domain, 'blog/'), urljoin(domain, 'news/'), urljoin(domain, 'press/'), urljoin(domain, 'updates/')]
    candidates: List[str] = []
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
                    candidates.append(urljoin(s, href))
    # Common direct feed paths
    for p in ['feed', 'rss', 'rss.xml', 'atom.xml', 'index.xml', 'blog/rss', 'blog/feed', 'news/rss', 'news/feed']:
        candidates.append(urljoin(domain, p))
    # Dedup
    candidates = list(dict.fromkeys(candidates))
    # Validate by fetching a few bytes and parsing
    valid: List[str] = []
    for c in candidates:
        content = fetch_bytes(c, timeout=6)
        if not content:
            continue
        try:
            parsed = feedparser.parse(content)
            if getattr(parsed, 'entries', None):
                valid.append(c)
        except Exception:
            continue
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


def run_company(name: str, domain: str, roots: List[str], conn) -> Dict:
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    # RSS (fast local discovery + feedparser)
    feeds = discover_rss_feeds_fast(domain)
    rss_items: List[Dict] = []
    seen = set()
    for f in feeds:
        r = fallback_scrape_company_rss(name, f)
        rss = (r.get('categories', {}) or {}).get('rss', {})
        items = rss.get('items', []) or []
        for item in items:
            u = item.get('url') or ''
            if u in seen:
                continue
            seen.add(u)
            if not DRY_RUN and conn is not None:
                try:
                    existing_id = find_existing_item(conn, name, 'rss', u or f)
                    if not existing_id:
                        new_id = insert_item(conn, name, 'rss', u or f, {
                            'text_content': (item.get('title','') + '\n\n' + (item.get('content','') or ''))
                        }, 0.0, 1.0, r.get('scraped_at', datetime.now().isoformat()))
                        store_rss_meta(conn, new_id, item.get('author',''), item.get('published',''), f)
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

    # DOCS (augment roots with sitemap-derived URLs as seeds)
    sitemap_urls = discover_from_sitemap(domain, roots)
    doc_seed_roots = list(dict.fromkeys((roots or [domain]) + sitemap_urls[:10]))  # keep seed set manageable
    doc_pages = crawl_docs(name, doc_seed_roots, MAX_DOC_PAGES_PER_COMPANY, MAX_DEPTH)
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
        print(f"   Docs pages captured (scored): {len(doc_pages)} | Top: " + "; ".join([p.get('title','')[:60] for p in doc_pages[:5]]))

    return {
        'rss_count': len(rss_items),
        'docs_count': len(doc_pages),
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
        consolidated[name] = run_company(name, domain, docs_roots, conn)

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
