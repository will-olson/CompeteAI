#!/usr/bin/env python3
"""
Unified Competitive Monitor: RSS + Docs
- Discovers RSS feeds and scrapes via /api/scrape/company
- Discovers doc targets (basic heuristics) and scrapes via internal requests fetch
- Persists to SQLite with metadata
- Runs AI analysis for RSS, docs, and combined
- Generates per-company and consolidated markdown reports
"""

import os
import json
import time
import hashlib
import requests
from datetime import datetime
from typing import List, Dict
from urllib.parse import urljoin
from pathlib import Path
from bs4 import BeautifulSoup

from store_scrape_to_sqlite import (
    BASE_URL,
    OUTPUT_DIR,
    DB_PATH,
    ensure_dirs,
    init_db,
    insert_item,
)
from rss_batch_scrape_and_insights import (
    discover_rss_feeds,
    scrape_company_rss,
    summarize_rss_items,
    write_insights_markdown as write_rss_insights_md,
    ai_analyze_company_rss,
    write_ai_summary_markdown as write_rss_ai_md,
    ensure_rss_meta_table,
    store_rss_meta,
    find_existing_item,
)

HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}

COMPANIES = [
    {"name": "Snowflake", "domain": "https://www.snowflake.com/"},
    {"name": "Databricks", "domain": "https://www.databricks.com/"},
    {"name": "PowerBI", "domain": "https://powerbi.microsoft.com/"},
    {"name": "Tableau", "domain": "https://www.tableau.com/"},
    {"name": "Omni", "domain": "https://www.omni.co/"},
    {"name": "Looker", "domain": "https://cloud.google.com/looker"},
    {"name": "Oracle", "domain": "https://www.oracle.com/business-analytics/business-intelligence/technologies/bi-enterprise-edition.html"},
    {"name": "SAP BusinessObjects", "domain": "https://www.sap.com/products/data-cloud/bi-platform.html"},
    {"name": "Tableau", "domain": "https://www.tableau.com/"},
    {"name": "Qlik", "domain": "https://www.qlik.com/"},
    {"name": "MicroStrategy", "domain": "https://www.microstrategy.com/"},
    {"name": "Qlik", "domain": "https://www.qlik.com/"},
    {"name": "Hex", "domain": "https://hex.tech/"},
    {"name": "Thoughtspot", "domain": "https://www.thoughtspot.com/"},
    {"name": "Domo", "domain": "https://www.domo.com/"},
]

DOC_CANDIDATE_PATHS = ["docs", "developers", "reference", "api", "help"]


def fetch(url: str) -> str:
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code == 200:
            return r.text
    except Exception:
        pass
    return ""


def discover_doc_targets(base: str, limit: int = 5) -> List[str]:
    targets: List[str] = []
    for p in DOC_CANDIDATE_PATHS:
        u = urljoin(base if base.endswith("/") else base + "/", p)
        try:
            h = requests.head(u, headers=HEADERS, timeout=8, allow_redirects=True)
            if h.status_code == 200 and "text/html" in h.headers.get("Content-Type", ""):
                targets.append(u)
        except Exception:
            continue
    return targets[:limit]


def make_hash(text: str) -> str:
    return hashlib.md5(text.encode("utf-8", errors="ignore")).hexdigest()


def scrape_doc_page(company: str, url: str) -> Dict:
    html = fetch(url)
    if not html:
        return {}
    soup = BeautifulSoup(html, "html.parser")
    title = (soup.find("title").get_text() if soup.find("title") else url)
    main = soup.find("main") or soup.find("article") or soup.find("body")
    text = main.get_text(" ", strip=True) if main else soup.get_text(" ", strip=True)
    return {"company": company, "title": title, "content": text, "url": url}


def ai_analyze_docs(company: str, items: List[Dict]) -> Dict:
    data = {
        'summary': {
            'total_companies': 1,
            'total_items': len(items),
            'total_words': sum(len((i.get('content','') or '').split()) for i in items),
            'total_links': 0,
            'total_images': 0,
            'rich_content_count': 0
        },
        'companies': {
            company: {
                'summary': {
                    'total_items': len(items),
                    'total_words': sum(len((i.get('content','') or '').split()) for i in items),
                    'rich_content_count': 0
                },
                'categories': {
                    'docs': {
                        'items': items
                    }
                }
            }
        }
    }
    try:
        resp = requests.post(f"{BASE_URL}/api/ai/analyze", json={'data': data, 'analysis_type': 'comprehensive'}, timeout=60)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {'error': str(e), 'message': 'AI analyze call failed'}


def write_docs_ai_md(company: str, analysis: dict, timestamp: str) -> Path:
    out = OUTPUT_DIR / f"DOCS_AI_SUMMARY_{company}_{timestamp}.md"
    md = [f"# AI Summary — {company} (Docs)", "", f"- Generated: {timestamp}", ""]
    if analysis.get('error'):
        md += ["AI analysis failed:", "", analysis.get('message', analysis['error'])]
    else:
        md += ["## Key Findings"] + [f"- {x}" for x in analysis.get('key_findings', [])[:10]] + [""]
        md += ["## Strategic Recommendations"] + [f"- {x}" for x in analysis.get('strategic_recommendations', [])[:10]] + [""]
        md += ["## AI Insights (raw)", "", analysis.get('ai_insights', '')[:2000]]
    out.write_text("\n".join(md), encoding="utf-8")
    return out


def write_consolidated_report(results: Dict[str, Dict], timestamp: str) -> Path:
    out = OUTPUT_DIR / f"CONSOLIDATED_COMPETITIVE_REPORT_{timestamp}.md"
    md: List[str] = ["# Consolidated Competitive Report", "", f"Generated: {timestamp}", ""]
    for company, data in results.items():
        md += [f"## {company}", ""]
        md += ["### RSS", ""]
        md += [f"- Items: {data.get('rss_count', 0)}", f"- AI Summary: {data.get('rss_ai_md','')}", ""]
        md += ["### Docs", ""]
        md += [f"- Pages: {data.get('docs_count', 0)}", f"- AI Summary: {data.get('docs_ai_md','')}", ""]
    out.write_text("\n".join(md), encoding="utf-8")
    return out


def main():
    ensure_dirs()
    conn = init_db()
    ensure_rss_meta_table(conn)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    consolidated: Dict[str, Dict] = {}

    for c in COMPANIES:
        name = c["name"]
        domain = c["domain"]
        print(f"\n➡️ Unified run: {name}")

        # RSS
        feeds = discover_rss_feeds([domain, urljoin(domain, "blog/")])
        rss_items = []
        seen = set()
        for f in feeds:
            r = scrape_company_rss(name, f)
            cats = r.get("categories", {}) or {}
            rss = cats.get("rss", {}) or {}
            items = rss.get("items", []) or []
            for item in items:
                url = item.get("url") or ""
                if url in seen:
                    continue
                seen.add(url)
                # persist if new
                from rss_batch_scrape_and_insights import insert_item as _ins  # reuse
                from rss_batch_scrape_and_insights import store_rss_meta as _meta
                existing_id = find_existing_item(conn, name, "rss", url or f)
                if not existing_id:
                    new_id = insert_item(conn, name, "rss", url or f, {"text_content": (item.get("title","")+"\n\n"+(item.get("content","") or ""))}, 0.0, 1.0, r.get("scraped_at", datetime.now().isoformat()))
                    store_rss_meta(conn, new_id, item.get("author",""), item.get("published",""), f)
                rss_items.append(item)
        rss_summary = summarize_rss_items(rss_items)
        rss_md = write_rss_insights_md(name, feeds, rss_items, rss_summary, timestamp)
        rss_ai = ai_analyze_company_rss(name, rss_items)
        rss_ai_md = str((OUTPUT_DIR / f"RSS_AI_SUMMARY_{name}_{timestamp}.md").resolve())
        write_rss_ai_md(name, rss_ai, timestamp)

        # Docs
        doc_targets = discover_doc_targets(domain)
        doc_items = []
        for u in doc_targets:
            page = scrape_doc_page(name, u)
            if not page:
                continue
            content_hash = make_hash(page.get("content", ""))
            existing_id = find_existing_item(conn, name, "docs", u)
            if not existing_id:
                new_id = insert_item(conn, name, "docs", u, {"text_content": page.get("content","")}, 0.0, 1.0, datetime.now().isoformat())
            doc_items.append(page)
        docs_ai = ai_analyze_docs(name, doc_items)
        docs_ai_md = str((OUTPUT_DIR / f"DOCS_AI_SUMMARY_{name}_{timestamp}.md").resolve())
        write_docs_ai_md(name, docs_ai, timestamp)

        consolidated[name] = {
            'rss_count': len(rss_items),
            'rss_ai_md': rss_ai_md,
            'docs_count': len(doc_items),
            'docs_ai_md': docs_ai_md,
        }

    consolidated_md = write_consolidated_report(consolidated, timestamp)
    print(f"\n📄 Consolidated report: {consolidated_md}")


if __name__ == "__main__":
    main()
