# Hardcoded Scraping Implementation Guide

## Overview

This guide explains how to use the hardcoded content mapping system to create a reliable, precision-targeted competitor scraping mechanism that supports complete client functionality in the browser.

## Files Overview

### 1. **`hardcoded_content_mapping_template.json`**
- **Purpose**: Template for manually mapping competitor content sources
- **Content**: Placeholder URLs for all 12 content dimensions across 14 companies
- **Usage**: Replace PLACEHOLDER URLs with real, verified links

### 2. **`server/hardcoded_competitor_scraper.py`**
- **Purpose**: Python scraper that uses the content mapping
- **Features**: Strategic content extraction, quality scoring, dimension analysis
- **Output**: Structured data ready for frontend consumption

### 3. **`HARDCODED_COMPETITOR_SCRAPING_STRATEGY.md`**
- **Purpose**: Strategic overview and implementation roadmap
- **Content**: 4-week implementation plan with technical details

## Implementation Steps

### **Step 1: Manual Content Research & Link Sourcing**

#### **1.1 Research Each Competitor's Documentation Structure**
For each company in the template, manually research:

- **API Documentation**: Developer portals, SDK docs, REST/GraphQL specs
- **Architecture Guides**: System design, deployment, scaling documentation
- **Pricing Pages**: Cost structures, feature comparisons, enterprise pricing
- **Integration Docs**: Data connectors, ETL processes, third-party integrations
- **Developer Portals**: Getting started guides, tutorials, community resources

#### **1.2 Identify RSS Feeds**
Look for:
- Company blog RSS feeds
- Product update feeds
- Documentation change feeds
- Community update feeds

#### **1.3 Find Reddit Communities**
Search for:
- Company-specific subreddits (e.g., r/snowflake, r/databricks)
- Industry subreddits (e.g., r/BusinessIntelligence, r/dataengineering)
- Key discussion threads about features, issues, comparisons

#### **1.4 Discover GitHub Repositories**
Identify:
- Official company repositories
- Community projects and integrations
- Code examples and samples

### **Step 2: Update the Content Mapping Template**

#### **2.1 Replace Placeholder URLs**
```json
// Before (placeholder)
"api_documentation": [
  "PLACEHOLDER: https://docs.snowflake.com/en/developer-guide/sql-api/index.html"
]

// After (real URL)
"api_documentation": [
  "https://docs.snowflake.com/en/developer-guide/sql-api/index.html"
]
```

#### **2.2 Add Missing Content Sources**
If you discover additional content sources not in the template:

```json
"additional_sources": {
  "webinars": [
    "https://www.snowflake.com/webinars/...",
    "https://www.snowflake.com/webinars/..."
  ],
  "case_studies": [
    "https://www.snowflake.com/customers/...",
    "https://www.snowflake.com/customers/..."
  ]
}
```

#### **2.3 Validate URLs**
Before adding URLs to the template:
- Test each URL manually in a browser
- Ensure the content is publicly accessible
- Verify the content is relevant to the specified dimension
- Check that the content is regularly updated

### **Step 3: Test the Hardcoded Scraper**

#### **3.1 Install Dependencies**
```bash
cd server
pip install requests beautifulsoup4
```

#### **3.2 Test with a Single Company**
```bash
python3 hardcoded_competitor_scraper.py
```

This will test the scraper with Snowflake and show:
- Content extraction success/failure
- Technical relevance scoring
- Strategic dimension analysis
- Content quality metrics

#### **3.3 Test with All Companies**
```python
from hardcoded_competitor_scraper import HardcodedCompetitorScraper

scraper = HardcodedCompetitorScraper()
results = scraper.scrape_all_competitors()

print(f"Scraped {results['overall_summary']['total_companies']} companies")
print(f"Total content: {results['overall_summary']['total_content_length']:,} characters")
print(f"Average technical score: {results['overall_summary']['total_technical_score']}")
```

### **Step 4: Integrate with Backend API**

#### **4.1 Add New API Endpoints to `insightforge_app.py`**
```python
@app.route('/api/hardcoded-content/<company_name>', methods=['GET'])
def get_hardcoded_content(company_name):
    """Get hardcoded strategic content for a specific company"""
    try:
        scraper = HardcodedCompetitorScraper()
        content = scraper.scrape_company_strategic_content(company_name)
        
        return jsonify({
            'success': True,
            'company': company_name,
            'data': content,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/hardcoded-content-all', methods=['GET'])
def get_all_hardcoded_content():
    """Get hardcoded strategic content for all companies"""
    try:
        scraper = HardcodedCompetitorScraper()
        all_content = scraper.scrape_all_competitors()
        
        return jsonify({
            'success': True,
            'data': all_content,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500
```

#### **4.2 Update Frontend API Service**
Add new methods to `client/src/utils/APIService.ts`:

```typescript
async getHardcodedContent(companyName: string): Promise<any> {
  return await this.makeRequest(`/api/hardcoded-content/${companyName}`);
}

async getAllHardcodedContent(): Promise<any> {
  return await this.makeRequest('/api/hardcoded-content-all');
}
```

### **Step 5: Frontend Integration**

#### **5.1 Update Technical Intelligence Dashboard**
Modify `client/src/pages/TechnicalIntelligenceDashboard.tsx` to use hardcoded content:

```typescript
const [hardcodedContent, setHardcodedContent] = useState<any>(null);

const fetchHardcodedContent = async () => {
  try {
    const content = await APIService.getAllHardcodedContent();
    setHardcodedContent(content.data);
  } catch (error) {
    console.error('Error fetching hardcoded content:', error);
  }
};

// Use hardcodedContent in your UI components
```

#### **5.2 Create Strategic Content Display Components**
Build components that display:
- **Content by Dimension**: Show content organized by strategic dimensions
- **Technical Scoring**: Visualize technical relevance scores
- **Strategic Analysis**: Display competitive positioning across dimensions
- **Content Quality Metrics**: Show success rates and content statistics

### **Step 6: Content Quality Validation**

#### **6.1 Monitor Scraping Success Rates**
Track:
- URL accessibility (HTTP status codes)
- Content extraction success
- Technical relevance scores
- Strategic dimension coverage

#### **6.2 Regular Content Validation**
- Weekly validation of hardcoded URLs
- Monthly content quality assessment
- Quarterly strategic dimension analysis
- Continuous improvement of scoring algorithms

## Expected Outcomes

### **Immediate Benefits**
- **Higher Success Rate**: 95%+ successful content extraction
- **Better Content Quality**: Technical documentation vs. marketing fluff
- **Strategic Alignment**: Content directly relevant to competitive analysis
- **Consistent Coverage**: All competitors have similar depth of content

### **Frontend Benefits**
- **Rich Data Visualization**: Comprehensive competitive intelligence
- **Strategic Insights**: Clear competitive positioning across dimensions
- **Interactive Analysis**: Drill-down capabilities into specific content areas
- **Real-time Updates**: Fresh content with each scraping run

### **Operational Benefits**
- **Predictable Performance**: Consistent scraping success rates
- **Scalable Architecture**: Easy to add new competitors and content types
- **Maintainable System**: Clear content mapping and validation processes
- **Quality Assurance**: Automated content quality scoring and validation

## Content Mapping Best Practices

### **1. URL Selection Criteria**
- **Relevance**: Content must be directly related to the specified dimension
- **Quality**: Prefer official documentation over marketing materials
- **Freshness**: Content should be regularly updated
- **Accessibility**: URLs must be publicly accessible without authentication

### **2. Content Dimension Prioritization**
- **High Priority**: API documentation, architecture guides, pricing pages
- **Medium Priority**: Integration docs, developer portals, tutorials
- **Low Priority**: Blog posts, Reddit sources, GitHub projects

### **3. Update Frequency Planning**
- **Weekly**: API docs, integration docs, developer portals
- **Monthly**: Architecture guides, pricing pages, tutorials
- **Daily**: RSS feeds for real-time updates

## Troubleshooting

### **Common Issues**

#### **1. URL Access Denied (403/401)**
- Check if content requires authentication
- Verify robots.txt restrictions
- Consider alternative content sources
- Update content mapping with accessible alternatives

#### **2. Low Technical Scores**
- Review content type classification
- Check for technical keyword presence
- Validate content quality and relevance
- Consider adjusting scoring algorithms

#### **3. Inconsistent Content Coverage**
- Ensure all competitors have similar content depth
- Balance content sources across dimensions
- Validate content mapping completeness
- Regular content mapping audits

### **Performance Optimization**

#### **1. Rate Limiting**
- Implement delays between requests (1-3 seconds)
- Respect website terms of service
- Use exponential backoff for failed requests
- Monitor and adjust scraping frequency

#### **2. Content Processing**
- Implement content caching for unchanged URLs
- Use incremental updates for frequently changing content
- Optimize text extraction and processing
- Implement parallel processing where appropriate

## Next Steps

### **Week 1: Content Research & Mapping**
- [ ] Research each competitor's documentation structure
- [ ] Identify key technical documentation URLs
- [ ] Map content sources to strategic dimensions
- [ ] Update content mapping template with real URLs

### **Week 2: Scraper Testing & Validation**
- [ ] Test hardcoded scraper with individual companies
- [ ] Validate content extraction and quality scoring
- [ ] Test scraper with all companies
- [ ] Optimize scraping performance and reliability

### **Week 3: Backend Integration**
- [ ] Add new API endpoints to Flask backend
- [ ] Test API endpoints with hardcoded content
- [ ] Validate data structure and quality
- [ ] Implement error handling and monitoring

### **Week 4: Frontend Integration & Testing**
- [ ] Update frontend API service
- [ ] Integrate hardcoded content into Technical Intelligence Dashboard
- [ ] Create content visualization components
- [ ] Test complete end-to-end functionality

## Conclusion

The hardcoded content mapping approach transforms the competitor scraping system from a general content collector into a strategic competitive intelligence engine. By combining manual research with automated extraction, you can achieve:

1. **Reliable Performance**: 95%+ success rates with predictable outcomes
2. **High-Quality Content**: Technical documentation focused on strategic insights
3. **Comprehensive Coverage**: All competitors analyzed across all dimensions
4. **Actionable Intelligence**: Data-driven competitive strategy development

This system provides the foundation for a fully functional client experience that delivers real competitive intelligence value to users.
