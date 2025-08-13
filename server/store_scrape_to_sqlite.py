#!/usr/bin/env python3
"""
Store Scraped Technical Content to SQLite and Generate Markdown Reports

- Calls the enhanced technical scraping API
- Stores results in SQLite (server/scraped_data.db)
- Generates per-category markdown summaries
- Generates an aggregate validation report
"""

import os
import re
import json
import time
import sqlite3
import requests
from datetime import datetime
from pathlib import Path

BASE_URL = os.environ.get("INSIGHTFORGE_BASE_URL", "http://localhost:3001")
OUTPUT_DIR = Path(__file__).parent / "competitive_intelligence_output" / "scraped_markdown"
DB_PATH = Path(__file__).parent / "scraped_data.db"

TEST_COMPANY = os.environ.get("SCRAPE_COMPANY", "OpenAI")
TEST_URLS = {
    "api_docs": os.environ.get("SCRAPE_URL_API_DOCS", "https://platform.openai.com/docs"),
    "pricing": os.environ.get("SCRAPE_URL_PRICING", "https://openai.com/pricing"),
    "features": os.environ.get("SCRAPE_URL_FEATURES", "https://openai.com/features"),
    "integrations": os.environ.get("SCRAPE_URL_INTEGRATIONS", "https://platform.openai.com/docs/integrations"),
}

SCHEMA_SQL = """
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS scraped_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    category TEXT NOT NULL,
    url TEXT NOT NULL,
    text_content TEXT,
    quality_score REAL,
    technical_relevance REAL,
    scraped_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS item_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    url TEXT,
    text TEXT,
    title TEXT,
    is_external INTEGER,
    FOREIGN KEY(item_id) REFERENCES scraped_items(id)
);
CREATE TABLE IF NOT EXISTS item_code_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    language TEXT,
    length INTEGER,
    snippet TEXT,
    FOREIGN KEY(item_id) REFERENCES scraped_items(id)
);
CREATE TABLE IF NOT EXISTS item_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    rows INTEGER,
    columns INTEGER,
    text TEXT,
    FOREIGN KEY(item_id) REFERENCES scraped_items(id)
);
"""


def ensure_dirs():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(SCHEMA_SQL)
    conn.commit()
    return conn


def scrape_technical(company: str, urls: dict) -> dict:
    payload = {"company": company, "urls": urls}
    resp = requests.post(f"{BASE_URL}/api/scrape/technical", json=payload, timeout=120)
    resp.raise_for_status()
    return resp.json()


def insert_item(conn, company: str, category: str, url: str, content: dict, quality: float, relevance: float, scraped_at: str) -> int:
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO scraped_items (company, category, url, text_content, quality_score, technical_relevance, scraped_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            company,
            category,
            url,
            (content or {}).get("text_content", ""),
            quality or 0.0,
            relevance or 0.0,
            scraped_at,
        ),
    )
    item_id = cur.lastrowid

    # Links
    for link in (content or {}).get("links", [])[:200]:
        cur.execute(
            """
            INSERT INTO item_links (item_id, url, text, title, is_external)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                item_id,
                link.get("url"),
                link.get("text"),
                link.get("title"),
                1 if link.get("is_external") else 0,
            ),
        )

    # Code blocks
    for block in (content or {}).get("code_blocks", [])[:200]:
        snippet = (block.get("text") or "")[:1000].replace("```", "``` ")
        cur.execute(
            """
            INSERT INTO item_code_blocks (item_id, language, length, snippet)
            VALUES (?, ?, ?, ?)
            """,
            (
                item_id,
                block.get("language"),
                block.get("length"),
                snippet,
            ),
        )

    # Tables
    for tbl in (content or {}).get("tables", [])[:200]:
        cur.execute(
            """
            INSERT INTO item_tables (item_id, rows, columns, text)
            VALUES (?, ?, ?, ?)
            """,
            (
                item_id,
                tbl.get("rows") or 0,
                tbl.get("columns") or 0,
                tbl.get("text", "")[:2000],
            ),
        )

    conn.commit()
    return item_id


def safe_filename(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]", "_", name)


def write_markdown(company: str, category: str, url: str, result: dict, timestamp: str) -> Path:
    fname = f"{safe_filename(company)}_{safe_filename(category)}_{timestamp}.md"
    fpath = OUTPUT_DIR / fname

    content = result.get("content", {})
    text_content = content.get("text_content", "")
    quality = result.get("quality_score", 0)
    relevance = result.get("technical_relevance", 0)

    md = []
    md.append(f"# {company} — {category} Technical Content Summary")
    md.append("")
    md.append(f"- URL: {url}")
    md.append(f"- Scraped At: {timestamp}")
    md.append(f"- Quality Score: {quality}/10")
    md.append(f"- Technical Relevance: {relevance}")
    md.append("")

    # Code blocks summary
    code_blocks = content.get("code_blocks", [])
    if code_blocks:
        md.append(f"## Code Blocks ({len(code_blocks)})")
        for i, cb in enumerate(code_blocks[:5], 1):
            lang = cb.get("language") or "unknown"
            snippet = (cb.get("text") or "")[:300].replace("```", "``` ")
            md.append(f"### Block {i} — {lang}")
            md.append("```")
            md.append(snippet)
            md.append("```")
            md.append("")

    # Tables summary
    tables = content.get("tables", [])
    if tables:
        md.append(f"## Tables ({len(tables)})")
        for i, tb in enumerate(tables[:5], 1):
            md.append(f"- Table {i}: rows={tb.get('rows')}, cols={tb.get('columns')}")
        md.append("")

    # Links summary
    links = content.get("links", [])
    if links:
        md.append(f"## Links ({len(links)})")
        for i, lk in enumerate(links[:10], 1):
            label = lk.get('text') or lk.get('url')
            url_val = lk.get('url')
            if url_val:
                md.append(f"- [{label}]({url_val})")
            else:
                md.append(f"- {label}")
        md.append("")

    # Text content preview
    if text_content:
        md.append("## Text Content Preview")
        md.append("")
        preview = text_content[:1200]
        md.append(preview)
        if len(text_content) > 1200:
            md.append("")
            md.append("…")

    fpath.write_text("\n".join(md), encoding="utf-8")
    return fpath


def write_error_markdown(company: str, category: str, url: str, error_msg: str, timestamp: str) -> Path:
    fname = f"{safe_filename(company)}_{safe_filename(category)}_{timestamp}_ERROR.md"
    fpath = OUTPUT_DIR / fname
    md = []
    md.append(f"# {company} — {category} Technical Content Summary (Error)")
    md.append("")
    md.append(f"- URL: {url}")
    md.append(f"- Scraped At: {timestamp}")
    md.append(f"- Status: Failed")
    md.append(f"- Error: {error_msg}")
    md.append("")
    md.append("This markdown documents the failed scraping attempt for validation and debugging purposes.")
    fpath.write_text("\n".join(md), encoding="utf-8")
    return fpath


def write_validation_report(company: str, api_result: dict, created_files: list, inserted_counts: dict, timestamp: str) -> Path:
    report_path = OUTPUT_DIR / f"SCRAPING_VALIDATION_REPORT_{safe_filename(company)}_{timestamp}.md"

    total_categories = api_result.get("total_categories", 0)
    successful_scrapes = api_result.get("successful_scrapes", 0)

    md = []
    md.append(f"# Scraping Validation Report — {company}")
    md.append("")
    md.append(f"- Generated: {timestamp}")
    md.append(f"- Total Categories Requested: {total_categories}")
    md.append(f"- Successful Scrapes: {successful_scrapes}")
    md.append(f"- Database: `{DB_PATH.name}`")
    md.append("")
    md.append("## Insert Summary")
    md.append("")
    md.append(f"- Items Inserted: {inserted_counts.get('items', 0)}")
    md.append(f"- Links Inserted: {inserted_counts.get('links', 0)}")
    md.append(f"- Code Blocks Inserted: {inserted_counts.get('code_blocks', 0)}")
    md.append(f"- Tables Inserted: {inserted_counts.get('tables', 0)}")
    md.append("")
    md.append("## Generated Markdown Files")
    md.append("")
    for fp in created_files:
        rel = fp.relative_to(OUTPUT_DIR.parent)
        md.append(f"- `{rel}`")
    md.append("")
    md.append("## Category Details")
    for category, result in (api_result.get("technical_results") or {}).items():
        if isinstance(result, dict):
            url = result.get("url", "")
            if "error" not in result:
                q = result.get("quality_score", 0)
                r = result.get("technical_relevance", 0)
                md.append("")
                md.append(f"### {category}")
                md.append(f"- URL: {url}")
                md.append(f"- Quality: {q}/10")
                md.append(f"- Technical Relevance: {r}")
            else:
                md.append("")
                md.append(f"### {category} (Failed)")
                md.append(f"- URL: {url}")
                md.append(f"- Error: {result.get('error')}")
    
    report_path.write_text("\n".join(md), encoding="utf-8")
    return report_path


def main():
    ensure_dirs()
    conn = init_db()

    print(f"🌐 Using backend: {BASE_URL}")
    print(f"🏷️  Company: {TEST_COMPANY}")
    print(f"🗃️  Database: {DB_PATH}")
    print(f"📝 Output dir: {OUTPUT_DIR}")

    result = scrape_technical(TEST_COMPANY, TEST_URLS)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    created_files = []
    inserted_counts = {"items": 0, "links": 0, "code_blocks": 0, "tables": 0}

    for category, data in (result.get("technical_results") or {}).items():
        url = (data or {}).get("url", TEST_URLS.get(category, ""))
        if not isinstance(data, dict):
            # Unexpected shape
            created_files.append(write_error_markdown(TEST_COMPANY, category, url, "Unexpected result format", timestamp))
            continue
        if "error" in data:
            # Write error markdown stub
            created_files.append(write_error_markdown(TEST_COMPANY, category, url, data.get("error", "Unknown error"), timestamp))
            continue

        content = data.get("content", {})
        item_id = insert_item(
            conn,
            TEST_COMPANY,
            category,
            url,
            content,
            data.get("quality_score"),
            data.get("technical_relevance"),
            result.get("scraped_at", datetime.now().isoformat()),
        )
        inserted_counts["items"] += 1

        # Count links / code / tables for the inserted item (best-effort from content arrays)
        inserted_counts["links"] += len(content.get("links", []))
        inserted_counts["code_blocks"] += len(content.get("code_blocks", []))
        inserted_counts["tables"] += len(content.get("tables", []))

        md_path = write_markdown(TEST_COMPANY, category, url, data, timestamp)
        created_files.append(md_path)

    report_path = write_validation_report(TEST_COMPANY, result, created_files, inserted_counts, timestamp)

    print("\n✅ Completed: Scraped, stored, and documented.")
    print(f"📄 Report: {report_path}")
    for f in created_files:
        print(f"📝 Markdown: {f}")


if __name__ == "__main__":
    main()
