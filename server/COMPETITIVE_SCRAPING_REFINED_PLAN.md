# Refined Competitive Scraping Plan (BI Competitors)

## Target set
- Snowflake, Databricks, PowerBI, Tableau, Omni, Looker, Oracle BI EE, SAP BusinessObjects, Qlik, MicroStrategy, Hex, ThoughtSpot, Domo

## Goals
- Capture enough technical documentation to explain: core concepts, API endpoints, auth, SDKs, integrations, rate limits, pricing signals, roadmap indicators
- Monitor recent activity via RSS/news/blogs/releases to contextualize changes

## Doc discovery (precise)
- Per-company doc roots (examples):
  - Snowflake: https://docs.snowflake.com/
  - Databricks: https://docs.databricks.com/
  - PowerBI: https://learn.microsoft.com/power-bi/
  - Tableau: https://help.tableau.com/
  - Omni: https://docs.omni.co/ (fallback: https://www.omni.co/)
  - Looker: https://cloud.google.com/looker/docs
  - Oracle BI: https://docs.oracle.com/ (BI product section)
  - SAP BO: https://help.sap.com/
  - Qlik: https://help.qlik.com/
  - MicroStrategy: https://www2.microstrategy.com/producthelp/
  - Hex: https://learn.hex.tech/ (or https://docs.hex.tech/)
  - ThoughtSpot: https://docs.thoughtspot.com/
  - Domo: https://domohelp.domo.com/ (and https://developer.domo.com/)
- Heuristics: also probe subdomains/paths: docs., help., developer., developers., learn., support., knowledge, api., reference, /developers, /api, /reference
- Sitemap probing: try /sitemap.xml at root and doc roots; collect up to N doc URLs per company matching keywords: docs, guide, api, reference, developer, help, learn, integration, sdk, authentication, oauth, webhook, quota, rate

## Doc crawl policy
- Depth: 1 hop from doc root; cap 50 pages per company for tests
- Only same-site URLs; normalize and dedupe by URL and content hash
- Extract:
  - Title, headings (h1–h3), paragraphs, tables, code blocks
  - Code language heuristics (fence class, or guess via keywords)
  - Links out to SDKs, OpenAPI, Postman collections
- Quality/relevance scoring: weight pages mentioning endpoints, auth, SDKs, webhooks, limits

## RSS/news targeting
- Seeds per company: domain roots joined with blog/, news/, updates/, press/, newsroom/, releases/
- Discover via <link rel="alternate" type="application/rss+xml|atom+xml"> and common feed paths (/feed, /rss, /atom.xml)
- Deduplicate by URL and content hash; store published date, author, source feed

## Storage (SQLite now)
- Use existing tables: scraped_items, rss_items_meta
- Add indexes if needed on (company_id, category), (url), (content_hash)

## AI analysis outputs
- Per-company docs summary: key capabilities, API auth, rate limits, SDKs, notable integrations, deployment/enterprise features
- Per-company RSS summary: last-30-days changes, product updates, launches, ecosystem updates
- Combined summary: gaps, differentiators, migration blockers, enterprise-readiness signals
- Cross-company matrix (markdown): capability vs vendor, API readiness, SDK coverage, integration breadth

## Reports
- Per-company: DOCS_AI_SUMMARY_<company>_<ts>.md, RSS_AI_SUMMARY_<company>_<ts>.md
- Consolidated: CROSS_COMPETITIVE_MATRIX_<ts>.md, CONSOLIDATED_COMPETITIVE_REPORT_<ts>.md

## Test plan (this pass)
- Curate doc roots per company; crawl up to 30–50 pages each
- Discover and parse feeds; collect last 30–50 items if available
- Persist to DB; run AI; generate reports

## Success criteria
- For at least 8/13 companies: ≥15 high-signal doc pages captured; RSS items ≥10
- Reports clearly enumerate: API auth method(s), endpoint patterns, SDK languages, limits/quotas, top 5 integrations

## Next iteration
- OpenAPI discovery and parsing
- Deeper doc classification and endpoint extraction
- Scheduled runs and change logs
