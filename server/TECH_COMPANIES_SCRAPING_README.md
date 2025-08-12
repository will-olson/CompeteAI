# Tech Companies Scraping System

## Overview

This system provides comprehensive scraping capabilities for enterprise software, business intelligence, and cloud data platform companies. It follows the same architecture pattern as the financial data pipeline but is specifically designed for technology companies.

## Architecture

### Three-File System (Similar to Financial Pipeline)

1. **`tech_companies.json`** - Data Source Catalog
   - Contains 12 categories of tech companies
   - ~200+ categorized company names
   - Acts as the "shopping list" for data collection

2. **`tech_companies_scraper.py`** - Data Collection Engine
   - Python scraper using Selenium and BeautifulSoup
   - Dynamic URL generation for different company categories
   - Supports multiple selection strategies (random, category-specific, individual)

3. **`tech_preset_groups.json`** - Preset Competitor Groups
   - Pre-configured groups for frontend testing
   - 8 specialized industry groups
   - URL patterns for each group

## Company Categories

### 1. Enterprise Software
- **Companies**: Salesforce, Oracle, SAP, Microsoft, Adobe, Workday, ServiceNow, Atlassian
- **Focus**: Core enterprise applications and platforms

### 2. Business Intelligence
- **Companies**: Tableau, PowerBI, Qlik, Looker, Domo, Sisense
- **Focus**: Data visualization and analytics platforms

### 3. Cloud Platforms
- **Companies**: AWS, Microsoft Azure, Google Cloud, IBM Cloud, Oracle Cloud
- **Focus**: Cloud infrastructure and platform services

### 4. AI/ML Platforms
- **Companies**: OpenAI, Anthropic, Google AI, Microsoft AI, NVIDIA, Databricks
- **Focus**: Artificial intelligence and machine learning tools

### 5. Collaboration Tools
- **Companies**: Slack, Notion, Figma, Airtable, Asana, Monday
- **Focus**: Team productivity and collaboration software

### 6. Developer Tools
- **Companies**: GitHub, GitLab, JetBrains, Docker, Kubernetes, Terraform
- **Focus**: Software development and DevOps tools

### 7. Data Warehousing
- **Companies**: Snowflake, Amazon Redshift, Google BigQuery, Azure Synapse
- **Focus**: Data storage and analytics platforms

### 8. Security Platforms
- **Companies**: CrowdStrike, SentinelOne, Carbon Black, Sophos, Trend Micro
- **Focus**: Cybersecurity and threat management

## Dynamic URL Generation

The scraper automatically generates URLs for each company using intelligent patterns:

### Marketing URLs
```
https://{company}.com
https://www.{company}.com
https://{company}.io
https://{company}.ai
https://{company}.tech
```

### Documentation URLs
```
https://{company}.com/docs
https://docs.{company}.com
https://developer.{company}.com
https://{company}.com/developers
https://{company}.com/api
```

### RSS Feed URLs
```
https://{company}.com/blog/feed
https://{company}.com/feed
https://{company}.com/news/feed
https://{company}.com/updates/feed
https://{company}.com/insights/feed
```

### Social/Community URLs
```
https://{company}.com/social
https://{company}.com/community
https://{company}.com/connect
https://{company}.com/network
https://{company}.com/partners
```

## Usage Examples

### 1. Scrape Single Company
```python
from tech_companies_scraper import TechCompaniesScraper

scraper = TechCompaniesScraper()
company_data = scraper.scrape_company_data(
    company_name="Salesforce",
    categories=['marketing', 'docs'],
    max_pages=3
)
```

### 2. Scrape by Category
```python
# Scrape all collaboration tools companies
results = scraper.scrape_by_category(
    category='collaboration_tools',
    company_limit=5
)
```

### 3. Scrape Random Companies
```python
# Scrape 5 random companies across all categories
results = scraper.scrape_random_companies(
    count=5,
    categories=['marketing', 'docs']
)
```

### 4. Batch Scrape Specific Companies
```python
companies = ['Salesforce', 'HubSpot', 'Slack']
results = scraper.batch_scrape_companies(
    companies,
    categories=['marketing', 'docs', 'rss']
)
```

## Frontend Integration

### Loading Preset Groups
```typescript
// Load tech company preset groups
const techGroups = await APIService.getPresetGroups();
const enterpriseGroup = techGroups['enterprise_saas'];

// Use the group for scraping
const results = await APIService.scrapeGroup({
  group_name: enterpriseGroup.name,
  companies: enterpriseGroup.companies,
  categories: enterpriseGroup.categories
});
```

### Dynamic URL Testing
```typescript
// Test different URL patterns for a company
const companyUrls = {
  marketing: 'https://salesforce.com',
  docs: 'https://docs.salesforce.com',
  rss: 'https://salesforce.com/blog/feed',
  social: 'https://salesforce.com/community'
};

// Scrape each category
for (const [category, url] of Object.entries(companyUrls)) {
  const response = await APIService.scrapeCompany({
    company: 'Salesforce',
    urls: { [category]: url },
    categories: [category],
    page_limit: 10
  });
}
```

## Data Output Format

### Company Data Structure
```json
{
  "company_name": "Salesforce",
  "scraped_at": "2024-01-15 10:30:00",
  "categories": {
    "marketing": {
      "company": "Salesforce",
      "category": "marketing",
      "url": "https://salesforce.com",
      "title": "Salesforce: The Customer Company",
      "content": {
        "main_text": "Salesforce is the global leader in CRM...",
        "link_count": 45,
        "image_count": 12
      },
      "metrics": {
        "word_count": 1250,
        "character_count": 8500,
        "link_density": 0.036,
        "has_forms": true,
        "has_search": true,
        "has_navigation": true
      }
    }
  },
  "summary": {
    "total_pages": 1,
    "total_words": 1250,
    "total_links": 45,
    "total_images": 12,
    "successful_categories": 1
  }
}
```

## Testing and Development

### Run URL Generation Test
```bash
cd server
python test_tech_scraper.py
```

### Test Individual Scraping
```bash
# Uncomment the test you want to run in test_tech_scraper.py
python test_tech_scraper.py
```

### Frontend Testing
1. **Load Preset Groups**: Use the tech company preset groups in your frontend
2. **Test URL Patterns**: Try different URL combinations for companies
3. **Validate Scraping**: Check that real content is being extracted
4. **Monitor Performance**: Track scraping success rates and timing

## Configuration

### Environment Variables
```bash
# Optional: Set Chrome driver path
CHROME_DRIVER_PATH=/path/to/chromedriver

# Optional: Set scraping delays
SCRAPING_DELAY=2
BETWEEN_COMPANIES_DELAY=3
```

### Chrome Options
```python
# Modify Chrome options in tech_companies_scraper.py
chrome_options.add_argument('--headless')  # For server environments
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
```

## Error Handling

### Common Issues
1. **Rate Limiting**: Built-in delays between requests
2. **URL Accessibility**: Automatic fallback to working URLs
3. **Content Extraction**: Graceful handling of failed extractions
4. **Network Issues**: Retry logic and timeout handling

### Logging
- All operations logged with timestamps
- Error details captured for debugging
- Success/failure metrics tracked
- Performance timing information

## Performance Considerations

### Optimization Features
- **Parallel Processing**: Can be extended for concurrent scraping
- **Caching**: Results cached to avoid re-scraping
- **Incremental Updates**: Only scrape new/changed content
- **Resource Management**: Efficient memory and browser handling

### Scalability
- **Batch Processing**: Handle multiple companies efficiently
- **Category Filtering**: Focus on specific content types
- **Page Limits**: Control depth of scraping
- **Export Options**: Multiple output formats (JSON, CSV)

## Integration with Existing System

### Backend API Endpoints
- **`/api/scrape/company`**: Single company scraping
- **`/api/scrape/group`**: Batch competitor group scraping
- **`/api/preset-groups`**: Load tech company preset groups

### Data Flow
```
Frontend Request → Backend API → Tech Companies Scraper → 
JSON Output → Frontend Display → Analytics Dashboard
```

## Future Enhancements

### Planned Features
1. **AI Content Analysis**: Analyze scraped content for insights
2. **Competitive Intelligence**: Compare companies across categories
3. **Trend Analysis**: Track changes over time
4. **Automated Monitoring**: Scheduled scraping and alerts
5. **Advanced Filtering**: Content-based company selection

### Extensibility
- **New Categories**: Easy to add new company categories
- **Custom Scrapers**: Extend for specific company types
- **Data Sources**: Integrate with additional data providers
- **Export Formats**: Support for more output formats

## Conclusion

This tech companies scraping system provides a robust foundation for competitive intelligence and market research in the technology sector. It follows proven architectural patterns and can be easily integrated with your existing frontend and backend systems.

The dynamic URL generation and comprehensive company categorization make it ideal for frontend testing and real-world competitive analysis scenarios. 