#!/usr/bin/env python3
"""
Batch scrape 10 enterprise services (BI, Cloud Data, AI/ML) technical docs
- Calls /api/scrape/technical per company with selected URLs
- Stores into SQLite and generates markdown via helpers from store_scrape_to_sqlite
"""

import os
import json
import requests
from datetime import datetime
from pathlib import Path

from store_scrape_to_sqlite import (
    init_db,
    ensure_dirs,
    insert_item,
    write_markdown,
    write_error_markdown,
    write_validation_report,
    OUTPUT_DIR,
    DB_PATH,
    BASE_URL,
)

# Define 10 services across BI, Cloud Data, AI/ML
TARGETS = [
    {
        "company": "Tableau",
        "urls": {
            "api_docs": "https://help.tableau.com/current/api/overview/en-us/",
            "features": "https://www.tableau.com/products/tableau",
            "integrations": "https://help.tableau.com/current/online/en-us/to_integrations.htm",
            "pricing": "https://www.tableau.com/pricing"
        }
    },
    {
        "company": "PowerBI",
        "urls": {
            "api_docs": "https://learn.microsoft.com/power-bi/developer/",
            "features": "https://powerbi.microsoft.com/features/",
            "integrations": "https://learn.microsoft.com/power-bi/connect-data/service-datasets-connect",
            "pricing": "https://powerbi.microsoft.com/pricing/"
        }
    },
    {
        "company": "Looker",
        "urls": {
            "api_docs": "https://cloud.google.com/looker/docs",
            "features": "https://cloud.google.com/looker",
            "integrations": "https://cloud.google.com/looker/docs/looker-integrations",
            "pricing": "https://cloud.google.com/pricing"
        }
    },
    {
        "company": "Snowflake",
        "urls": {
            "api_docs": "https://docs.snowflake.com/en/",
            "features": "https://www.snowflake.com/en/platform/",
            "integrations": "https://docs.snowflake.com/en/user-guide/ecosystem-connector-overview",
            "pricing": "https://www.snowflake.com/pricing/"
        }
    },
    {
        "company": "Databricks",
        "urls": {
            "api_docs": "https://docs.databricks.com/en/",
            "features": "https://www.databricks.com/product",
            "integrations": "https://docs.databricks.com/en/integrations/index.html",
            "pricing": "https://www.databricks.com/product/pricing"
        }
    },
    {
        "company": "BigQuery",
        "urls": {
            "api_docs": "https://cloud.google.com/bigquery/docs",
            "features": "https://cloud.google.com/bigquery",
            "integrations": "https://cloud.google.com/bigquery/docs/load-data-cloud-storage",
            "pricing": "https://cloud.google.com/bigquery/pricing"
        }
    },
    {
        "company": "SageMaker",
        "urls": {
            "api_docs": "https://docs.aws.amazon.com/sagemaker/",
            "features": "https://aws.amazon.com/sagemaker/",
            "integrations": "https://docs.aws.amazon.com/sagemaker/latest/dg/algos.html",
            "pricing": "https://aws.amazon.com/sagemaker/pricing/"
        }
    },
    {
        "company": "AzureML",
        "urls": {
            "api_docs": "https://learn.microsoft.com/azure/machine-learning/",
            "features": "https://azure.microsoft.com/products/machine-learning",
            "integrations": "https://learn.microsoft.com/azure/machine-learning/component-and-data",
            "pricing": "https://azure.microsoft.com/pricing/details/machine-learning/"
        }
    },
    {
        "company": "VertexAI",
        "urls": {
            "api_docs": "https://cloud.google.com/vertex-ai/docs",
            "features": "https://cloud.google.com/vertex-ai",
            "integrations": "https://cloud.google.com/vertex-ai/docs/integrations",
            "pricing": "https://cloud.google.com/vertex-ai/pricing"
        }
    },
    {
        "company": "Datadog",
        "urls": {
            "api_docs": "https://docs.datadoghq.com/api/latest/",
            "features": "https://www.datadoghq.com/product/",
            "integrations": "https://docs.datadoghq.com/integrations/",
            "pricing": "https://www.datadoghq.com/pricing/"
        }
    }
]


def scrape_company(company: str, urls: dict) -> dict:
    payload = {"company": company, "urls": urls}
    resp = requests.post(f"{BASE_URL}/api/scrape/technical", json=payload, timeout=180)
    resp.raise_for_status()
    return resp.json()


def main():
    ensure_dirs()
    conn = init_db()

    print(f"🌐 Backend: {BASE_URL}")
    print(f"🗃️  DB: {DB_PATH}")
    print(f"📝 Out: {OUTPUT_DIR}")

    for target in TARGETS:
        company = target["company"]
        urls = target["urls"]
        print(f"\n➡️  Scraping: {company}")
        result = scrape_company(company, urls)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        created_files = []
        counts = {"items": 0, "links": 0, "code_blocks": 0, "tables": 0}

        for category, data in (result.get("technical_results") or {}).items():
            url = (data or {}).get("url", urls.get(category, ""))
            if not isinstance(data, dict):
                created_files.append(write_error_markdown(company, category, url, "Unexpected result format", timestamp))
                continue
            if "error" in data:
                created_files.append(write_error_markdown(company, category, url, data.get("error", "Unknown error"), timestamp))
                continue

            content = data.get("content", {})
            insert_item(
                conn,
                company,
                category,
                url,
                content,
                data.get("quality_score"),
                data.get("technical_relevance"),
                result.get("scraped_at", datetime.now().isoformat()),
            )
            counts["items"] += 1
            counts["links"] += len(content.get("links", []))
            counts["code_blocks"] += len(content.get("code_blocks", []))
            counts["tables"] += len(content.get("tables", []))

            created_files.append(write_markdown(company, category, url, data, timestamp))

        report = write_validation_report(company, result, created_files, counts, timestamp)
        print(f"✅ {company} report: {report}")


if __name__ == "__main__":
    main()
