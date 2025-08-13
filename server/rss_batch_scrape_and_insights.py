#!/usr/bin/env python3
"""
Batch RSS Scrape and Insights for Cloud-Native BI and Workflow/PM Platforms

- Dynamically discovers RSS/Atom feeds from base and blog URLs
- Calls /api/scrape/company with categories ['rss'] for discovered feeds
- Merges items per company, stores to SQLite, generates insights markdown
"""

import os
import re
import json
import math
import requests
from datetime import datetime
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse, urljoin
from typing import List, Dict, Tuple, Set

from bs4 import BeautifulSoup

from store_scrape_to_sqlite import (
    BASE_URL,
    OUTPUT_DIR,
    DB_PATH,
    ensure_dirs,
    init_db,
    insert_item,
)

def ensure_rss_meta_table(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS rss_items_meta (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            author TEXT,
            published TEXT,
            source_feed TEXT,
            FOREIGN KEY(item_id) REFERENCES scraped_items(id)
        );
        """
    )
    conn.commit()


def find_existing_item(conn, company: str, category: str, url: str):
    cur = conn.cursor()
    cur.execute(
        "SELECT id FROM scraped_items WHERE company = ? AND category = ? AND url = ? LIMIT 1",
        (company, category, url),
    )
    row = cur.fetchone()
    return row[0] if row else None


def store_rss_meta(conn, item_id: int, author: str, published: str, source_feed: str):
    conn.execute(
        """
        INSERT INTO rss_items_meta (item_id, author, published, source_feed)
        VALUES (?, ?, ?, ?)
        """,
        (item_id, author or "", published or "", source_feed or ""),
    )
    conn.commit()

# Expanded group: Cloud-native BI + Workflow/PM + Automation
COMPANIES = [
    {"company": "Datadog", "bases": ["https://www.datadoghq.com/", "https://www.datadoghq.com/blog/"]},
    {"company": "Snowflake", "bases": ["https://www.snowflake.com/", "https://www.snowflake.com/blog/"]},
    {"company": "Databricks", "bases": ["https://www.databricks.com/", "https://www.databricks.com/blog"]},
    {"company": "BigQuery", "bases": ["https://cloud.google.com/bigquery", "https://cloud.google.com/blog/topics/bigquery"]},
    {"company": "Tableau", "bases": ["https://www.tableau.com/", "https://www.tableau.com/blog"]},
    {"company": "PowerBI", "bases": ["https://powerbi.microsoft.com/", "https://powerbi.microsoft.com/blog/"]},
    {"company": "Asana", "bases": ["https://asana.com/", "https://blog.asana.com/"]},
    {"company": "Trello", "bases": ["https://trello.com/", "https://blog.trello.com/"]},
    {"company": "Jira", "bases": ["https://www.atlassian.com/software/jira", "https://www.atlassian.com/blog/jira-software"]},
    {"company": "Monday", "bases": ["https://monday.com/", "https://monday.com/blog/"]},
    {"company": "Zapier", "bases": ["https://zapier.com/", "https://zapier.com/blog/"]},
    {"company": "Airtable", "bases": ["https://airtable.com/", "https://blog.airtable.com/"]},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
}

STOPWORDS = set(
    "the a an and or to of for in on with at by from is are be this that it as into about over under we you our their your its".split()
)

COMMON_FEED_PATHS = [
    "feed", "feed.xml", "rss", "rss.xml", "atom.xml",
    "blog/feed", "blog/feed.xml", "blog/rss", "blog/rss.xml",
    "news/feed", "news/rss", "posts/feed"
]


def fetch_html(url: str) -> str:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code == 200:
            return resp.text
    except Exception:
        pass
    return ""


def is_feed_href(href: str) -> bool:
    h = href.lower()
    return h.endswith(".xml") or "rss" in h or "atom" in h or "/feed" in h


def discover_rss_feeds(base_urls: List[str]) -> List[str]:
    discovered: List[str] = []
    seen: Set[str] = set()

    for base in base_urls:
        # Try HTML discovery
        html = fetch_html(base)
        if html:
            try:
                soup = BeautifulSoup(html, "html.parser")
                # <link rel="alternate" type="application/rss+xml" href="...">
                for link in soup.find_all("link"):
                    rel = " ".join(link.get("rel", [])).lower() if link.get("rel") else ""
                    typ = (link.get("type") or "").lower()
                    href = link.get("href") or ""
                    if href and ("alternate" in rel) and ("rss" in typ or "atom" in typ):
                        abs_url = urljoin(base, href)
                        if abs_url not in seen:
                            discovered.append(abs_url)
                            seen.add(abs_url)
                # Any <a> that looks like a feed
                for a in soup.find_all("a"):
                    href = a.get("href") or ""
                    if href and is_feed_href(href):
                        abs_url = urljoin(base, href)
                        if abs_url not in seen:
                            discovered.append(abs_url)
                            seen.add(abs_url)
            except Exception:
                pass

        # Try common feed paths
        try_paths = [urljoin(base if base.endswith("/") else base + "/", p) for p in COMMON_FEED_PATHS]
        for cand in try_paths:
            if cand in seen:
                continue
            try:
                r = requests.head(cand, headers=HEADERS, timeout=8, allow_redirects=True)
                if r.status_code == 200 and "text/html" not in r.headers.get("Content-Type", ""):
                    discovered.append(cand)
                    seen.add(cand)
            except Exception:
                continue

    # Deduplicate while preserving order
    deduped = []
    s = set()
    for u in discovered:
        if u not in s:
            deduped.append(u)
            s.add(u)
    return deduped[:5]


def scrape_company_rss(company: str, feed_url: str) -> dict:
    payload = {
        "company": company,
        "urls": {"rss": feed_url},
        "categories": ["rss"],
        "page_limit": 50,
    }
    resp = requests.post(f"{BASE_URL}/api/scrape/company", json=payload, timeout=120)
    resp.raise_for_status()
    return resp.json()


def tokenize(text: str) -> list:
    text = re.sub(r"[^a-zA-Z0-9 ]", " ", text.lower())
    return [t for t in text.split() if t and t not in STOPWORDS and len(t) > 2]


def extract_host(url: str) -> str:
    try:
        return urlparse(url).netloc or ""
    except Exception:
        return ""


def summarize_rss_items(items: list) -> dict:
    titles = [i.get("title", "") for i in items]
    contents = [i.get("content", "") for i in items]
    published = [i.get("published", "") for i in items]
    authors = [i.get("author", "") for i in items if i.get("author")]
    hosts = [extract_host(i.get("url", "")) for i in items if i.get("url")]

    tokens = []
    for t in titles:
        tokens.extend(tokenize(t))
    for c in contents:
        tokens.extend(tokenize(c))
    top_keywords = [w for w, _ in Counter(tokens).most_common(20)]

    host_counts = Counter([h for h in hosts if h])
    top_hosts = host_counts.most_common(10)

    announcement_terms = ["announce", "launch", "generally available", "ga", "beta", "preview", "integration", "feature", "update", "roadmap"]
    announcements = []
    for i in items[:100]:
        text = f"{i.get('title','')} {i.get('content','')}".lower()
        if any(term in text for term in announcement_terms):
            announcements.append({
                "title": i.get("title", ""),
                "url": i.get("url", ""),
                "published": i.get("published", ""),
            })
    announcements = announcements[:10]

    cadence = len([p for p in published if p])

    return {
        "count": len(items),
        "top_keywords": top_keywords,
        "top_hosts": top_hosts,
        "announcements": announcements,
        "cadence_count": cadence,
        "authors_unique": len(set(authors)) if authors else 0,
    }


def write_insights_markdown(company: str, feeds: List[str], items: list, summary: dict, timestamp: str) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f"RSS_INSIGHTS_{company}_{timestamp}.md"

    md = []
    md.append(f"# RSS Insights — {company}")
    md.append("")
    md.append("## Feeds")
    for f in feeds:
        md.append(f"- {f}")
    md.append("")
    md.append(f"- Items Collected: {summary['count']}")
    md.append(f"- Authors (distinct): {summary['authors_unique']}")
    md.append(f"- Posting Cadence (recent items with dates): {summary['cadence_count']}")
    md.append("")

    if summary["top_keywords"]:
        md.append("## Top Keywords")
        md.append("")
        md.append(", ".join(summary["top_keywords"]))
        md.append("")

    if summary["top_hosts"]:
        md.append("## Top Linked Hosts")
        md.append("")
        for host, cnt in summary["top_hosts"]:
            md.append(f"- {host}: {cnt}")
        md.append("")

    if summary["announcements"]:
        md.append("## Notable Announcements (Heuristic)")
        md.append("")
        for a in summary["announcements"]:
            line = f"- [{a['title']}]({a['url']})"
            if a.get("published"):
                line += f" — {a['published']}"
            md.append(line)
        md.append("")

    md.append("## Recent Items (up to 20)")
    md.append("")
    for i in items[:20]:
        title = i.get("title", "Untitled")
        url = i.get("url", "")
        pub = i.get("published", "")
        md.append(f"### {title}")
        if url:
            md.append(f"- Link: {url}")
        if pub:
            md.append(f"- Published: {pub}")
        snippet = (i.get("content", "") or "").strip()
        if snippet:
            md.append("")
            md.append(snippet[:800] + ("…" if len(snippet) > 800 else ""))
        md.append("")

    out_path.write_text("\n".join(md), encoding="utf-8")
    return out_path


def write_ai_summary_markdown(company: str, analysis: dict, timestamp: str) -> Path:
    out_path = OUTPUT_DIR / f"RSS_AI_SUMMARY_{company}_{timestamp}.md"
    md = []
    md.append(f"# AI Summary — {company} (RSS)")
    md.append("")
    md.append(f"- Generated: {timestamp}")
    md.append("")

    if analysis.get('error'):
        md.append("AI analysis failed:")
        md.append("")
        md.append(analysis.get('message', analysis['error']))
    else:
        md.append("## Key Findings")
        for f in analysis.get('key_findings', [])[:10]:
            md.append(f"- {f}")
        md.append("")
        md.append("## Strategic Recommendations")
        for r in analysis.get('strategic_recommendations', [])[:10]:
            md.append(f"- {r}")
        md.append("")
        md.append("## AI Insights (raw)")
        md.append("")
        md.append(analysis.get('ai_insights', '')[:2000])
    out_path.write_text("\n".join(md), encoding="utf-8")
    return out_path


def ai_analyze_company_rss(company: str, items: list) -> dict:
    # Build minimal data structure expected by /api/ai/analyze
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
                    'rss': {
                        'items': items
                    }
                }
            }
        }
    }
    try:
        resp = requests.post(
            f"{BASE_URL}/api/ai/analyze",
            json={'data': data, 'analysis_type': 'comprehensive'},
            timeout=60
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {'error': str(e), 'message': 'AI analyze call failed'}


def main():
    ensure_dirs()
    conn = init_db()
    ensure_rss_meta_table(conn)

    print(f"🌐 Backend: {BASE_URL}")
    print(f"🗃️  DB: {DB_PATH}")
    print(f"📝 Out: {OUTPUT_DIR}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    for entry in COMPANIES:
        company = entry["company"]
        bases = entry["bases"]
        print(f"\n➡️  RSS Scraping: {company}")

        try:
            feeds = discover_rss_feeds(bases)
            merged_items = []
            seen_urls = set()

            for feed in feeds or []:
                result = scrape_company_rss(company, feed)
                categories = result.get("categories", {}) or {}
                rss_data = categories.get("rss", {}) or {}
                items = rss_data.get("items", []) or []
                # Store
                for item in items:
                    url = item.get("url") or ""
                    if url in seen_urls:
                        continue
                    seen_urls.add(url)
                    existing_id = find_existing_item(conn, company, "rss", url or feed)
                    if existing_id:
                        continue
                    content_text = item.get("title", "") + "\n\n" + (item.get("content", "") or "")
                    new_item_id = insert_item(
                        conn,
                        company,
                        "rss",
                        url or feed,
                        {"text_content": content_text, "links": []},
                        quality=0.0,
                        relevance=1.0,
                        scraped_at=result.get("scraped_at", datetime.now().isoformat()),
                    )
                    store_rss_meta(conn, new_item_id, item.get("author", ""), item.get("published", ""), feed)
                    merged_items.append(item)

            summary = summarize_rss_items(merged_items)
            out_md = write_insights_markdown(company, feeds, merged_items, summary, timestamp)
            print(f"✅ {company} RSS insights: {out_md} (items stored: {len(merged_items)})")

            analysis = ai_analyze_company_rss(company, merged_items)
            ai_md = write_ai_summary_markdown(company, analysis, timestamp)
            print(f"🧠 {company} AI summary: {ai_md}")

        except Exception as e:
            print(f"❌ {company} RSS scrape failed: {e}")


if __name__ == "__main__":
    main()
