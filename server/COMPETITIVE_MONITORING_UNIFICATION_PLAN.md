# Competitive Monitoring: Improvements and Unification Plan

## Objectives
- Real-time monitoring of competitor activity (RSS/news/releases)
- Deep capture of product capabilities (technical docs, APIs, auth, rate limits)
- Unified orchestration, storage, and AI analysis with consolidated reporting

## Key Improvements

### Scraping engine
- RSS parsing
  - Prefer XML parsing for feeds; keep feedparser as primary
  - Dynamic feed discovery via HTML <link rel="alternate"> and common feed paths
  - Change detection via URL/content hash + published timestamps
- Technical documentation
  - Doc target discovery: test common doc roots (/docs, /developers, /reference, /api, /help) and sitemap.xml probing
  - OpenAPI discovery (openapi.json|yaml, swagger.json) when present
  - Structured extraction: endpoints, auth methods, rate limits, SDK languages, code examples
- Robust fetch
  - User-Agent rotation, retries/backoff, content-type detection, respectful rate limits

### Storage and models
- Tables (SQLite now; Postgres-ready later)
  - companies(id, name, domain)
  - sources(id, company_id, type[rss|docs], url, active, discovered_at)
  - scraped_items(id, company_id, category, url, title, text_content, content_hash, scraped_at)
  - rss_items_meta(item_id, author, published, source_feed)
  - doc_items_meta(item_id, endpoint_count, auth_methods, rate_limits, sdk_langs)
  - ai_analysis(item_id nullable, company_id, scope[rss|docs|combined], analysis_type, ai_provider, key_findings, recommendations, raw_text, generated_at)
- Indexes
  - (company_id, category), (url unique), (content_hash), (published), (generated_at)

### AI analysis
- Per-company RSS deltas and doc deltas
- Cross-company comparative summaries and change logs
- Export consolidated reports with key findings and recommendations

## Unification
- Single orchestrator script `unified_competitive_monitor.py`:
  - Loads companies config (YAML)
  - Discovers RSS feeds and doc targets
  - Scrapes RSS via /api/scrape/company; scrapes docs via discovered targets
  - Dedupes and stores in DB with metadata
  - Runs AI analysis (RSS, docs, combined)
  - Generates per-company markdown and one consolidated report
  - Supports one-shot and scheduled modes

## Near-term actions implemented
- Dynamic RSS discovery + insights markdown + AI summary
- RSS metadata storage (author, published, source_feed) and duplicate avoidance

## Next steps (this iteration)
1) Add the unified monitor script
2) Add simple doc target discovery and scraping via API
3) Generate consolidated markdown report
4) Wire AI combined analysis across RSS + docs for each company

## Later enhancements
- OpenAPI discovery and parsing for endpoint/auth/rate-limit intelligence
- Doc structure classifiers and richer technical extraction
- Notifications and dashboards
