# InsightForge Competitive Intelligence Backend

## Overview

The InsightForge Backend is a comprehensive competitive intelligence platform that provides:

- **Multi-source data collection** from marketing sites, documentation, RSS feeds, and social signals
- **AI-powered competitive analysis** using OpenAI and Anthropic APIs
- **Enterprise software analysis** for strategic assessment
- **Advanced analytics and insights** for competitive intelligence
- **Automated workflow management** for continuous monitoring

## Architecture

### Core Components

1. **`competitive_intelligence_scraper.py`** - Multi-source data collection engine
2. **`ai_competitive_analyzer.py`** - AI-powered analysis and insights
3. **`enterprise_software_analyzer.py`** - Enterprise software assessment framework
4. **`insightforge_app.py`** - Main Flask application with REST API endpoints

### Technology Stack

- **Backend Framework**: Flask with CORS support
- **Data Processing**: Pandas, NumPy for analytics
- **Web Scraping**: BeautifulSoup, Feedparser, Requests
- **AI Integration**: OpenAI GPT-4, Anthropic Claude
- **File Handling**: CSV, JSON, Markdown, DOCX support
- **Logging**: Comprehensive logging and error handling

## Installation & Setup

### Prerequisites

- Python 3.8+
- pip or conda package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the server directory:
   ```env
   # AI API Keys (at least one required for full functionality)
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # Web Scraping (optional)
   FIRECRAWL_API_KEY=your_firecrawl_api_key_here
   ```

4. **Run the application**
   ```bash
   python insightforge_app.py
   ```

The backend will start on `http://localhost:5001`

## API Endpoints

### Health & Status

- **`GET /api/health`** - Health check and service status

### Preset Group Management

- **`GET /api/preset-groups`** - List available preset competitor groups
- **`GET /api/preset-groups/<group_key>`** - Load specific preset group
- **`POST /api/custom-groups`** - Create custom competitor group

### Data Collection & Scraping

- **`POST /api/scrape/company`** - Scrape data for single company
- **`POST /api/scrape/group`** - Scrape data for competitor group
- **`POST /api/scrape/mass`** - Mass scrape all preset groups

### Data Import/Export

- **`POST /api/import/file`** - Import data from various file formats
- **`POST /api/export/data`** - Export data in specified format
- **`GET /api/download/<filename>`** - Download generated files

### AI-Powered Analysis

- **`POST /api/ai/analyze`** - Perform competitive analysis
- **`POST /api/ai/battlecard`** - Generate competitive battlecard
- **`POST /api/ai/content-strategy`** - Analyze content strategy
- **`POST /api/ai/competitive-moves`** - Detect competitive moves

### Enterprise Software Analysis

- **`POST /api/enterprise/analyze-category`** - Analyze software category
- **`POST /api/enterprise/generate-battlecard`** - Generate enterprise battlecard

### Analytics & Search

- **`POST /api/analytics/summary`** - Get analytics summary
- **`POST /api/search/content`** - Search across content

## Usage Examples

### 1. Load and Scrape Preset Group

```python
import requests

# Load Tech SaaS preset group
response = requests.get('http://localhost:5001/api/preset-groups/tech_saas')
group = response.json()

# Scrape the group
scrape_data = {
    'group': group,
    'page_limit': 10
}
response = requests.post('http://localhost:5001/api/scrape/group', json=scrape_data)
results = response.json()

print(f"Scraped {results['summary']['total_companies']} companies")
```

### 2. AI-Powered Competitive Analysis

```python
# Perform comprehensive analysis
analysis_data = {
    'data': results,  # From previous scraping
    'analysis_type': 'comprehensive'
}
response = requests.post('http://localhost:5001/api/ai/analyze', json=analysis_data)
analysis = response.json()

print(f"AI Analysis: {analysis['ai_insights'][:200]}...")
```

### 3. Generate Competitive Battlecard

```python
# Generate battlecard for HubSpot
battlecard_data = {
    'company_name': 'HubSpot',
    'competitors': ['Salesforce', 'Microsoft_Dynamics'],
    'data': results
}
response = requests.post('http://localhost:5001/api/ai/battlecard', json=battlecard_data)
battlecard = response.json()

print(f"Battlecard generated for {battlecard['company_name']}")
```

### 4. Enterprise Software Analysis

```python
# Analyze CRM software category
enterprise_data = {
    'category': 'customer_relationship_management'
}
response = requests.post('http://localhost:5001/api/enterprise/analyze-category', json=enterprise_data)
analysis = response.json()

print(f"Analyzed {analysis['products_analyzed']} products")
```

## Preset Competitor Groups

### Tech SaaS
- **Companies**: Salesforce, HubSpot, Slack, Notion, Figma, Airtable
- **Categories**: marketing, docs, RSS, social
- **Focus**: Productivity and collaboration software

### Fintech
- **Companies**: Stripe, Plaid, Coinbase, Robinhood, Chime, Affirm
- **Categories**: marketing, docs, RSS, social
- **Focus**: Financial technology and payments

### E-commerce
- **Companies**: Shopify, Amazon, Etsy, WooCommerce, BigCommerce, Magento
- **Categories**: marketing, docs, RSS, social
- **Focus**: E-commerce platforms and retail

### AI/ML
- **Companies**: OpenAI, Anthropic, Google AI, Microsoft AI, Meta AI, NVIDIA
- **Categories**: marketing, docs, RSS, social
- **Focus**: Artificial intelligence and machine learning

## Data Sources & Categories

### Marketing Sites
- Company websites and landing pages
- Product announcements and feature launches
- Pricing and positioning information

### Documentation
- API documentation and technical guides
- Developer resources and tutorials
- Integration guides and best practices

### RSS Feeds
- Company blogs and news updates
- Product release notes and changelogs
- Industry insights and thought leadership

### Social Signals
- Social media presence and engagement
- Community discussions and feedback
- Brand sentiment and market perception

## AI Analysis Types

### Comprehensive Analysis
- Market positioning and competitive advantages
- Content strategy and messaging approaches
- Innovation focus and technology trends
- Potential threats and opportunities
- Strategic recommendations

### Content Strategy Analysis
- Content themes and messaging consistency
- Content quality and engagement factors
- Content distribution and channel effectiveness
- Competitive content positioning
- Content strategy recommendations

### Competitive Moves Detection
- New product launches or feature announcements
- Pricing changes or business model shifts
- Partnership or acquisition activities
- Market positioning changes
- Strategic competitive moves and implications

### Risk Assessment
- Market positioning changes
- Technology disruptions
- Competitive moves and responses
- Customer sentiment shifts
- Industry dynamics

## File Import/Export Support

### Import Formats
- **CSV**: Structured data with headers
- **JSON**: Flexible data structures
- **Markdown**: Text-based content and documentation
- **DOCX**: Microsoft Word documents

### Export Formats
- **JSON**: Full data structure preservation
- **CSV**: Flattened data for external analysis

## Configuration Options

### Environment Variables

```env
# Required for AI functionality
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional for enhanced scraping
FIRECRAWL_API_KEY=fc_...

# Optional: Custom configuration
LOG_LEVEL=INFO
PORT=5001
DEBUG=True
```

### Scraping Configuration

- **Page Limits**: Control number of pages scraped per source
- **Rate Limiting**: Built-in delays to respect server resources
- **Error Handling**: Graceful degradation for failed scrapes
- **Mock Data**: Fallback data when scraping fails

## Monitoring & Logging

### Log Files
- `competitive_intelligence_scraper.log` - Scraping operations
- `ai_competitive_analyzer.log` - AI analysis operations
- `enterprise_software_analysis.log` - Enterprise analysis
- `insightforge_app.log` - Main application operations

### Health Monitoring
- Service status endpoints
- API response time monitoring
- Error rate tracking
- Resource utilization metrics

## Error Handling

### Graceful Degradation
- Mock data generation when AI APIs unavailable
- Fallback scraping methods when primary methods fail
- Comprehensive error logging and reporting
- User-friendly error messages

### Common Error Scenarios
- **API Key Missing**: Limited functionality with mock data
- **Network Issues**: Retry logic and fallback methods
- **Rate Limiting**: Automatic delays and retry strategies
- **Data Validation**: Input validation and error reporting

## Performance Considerations

### Optimization Features
- Efficient data processing with Pandas
- Memoized calculations for repeated operations
- Pagination for large datasets
- Background processing for long-running operations

### Scalability
- Modular architecture for easy scaling
- Configurable resource limits
- Efficient memory management
- Support for large competitor groups

## Security Features

### Data Protection
- Environment variable configuration for sensitive data
- Input validation and sanitization
- Rate limiting and abuse prevention
- Secure file handling

### Access Control
- CORS configuration for frontend integration
- Request validation and authentication
- Secure file upload and download
- Audit logging for all operations

## Development & Testing

### Local Development
```bash
# Run in development mode
python insightforge_app.py

# Run with custom port
PORT=5002 python insightforge_app.py

# Run with debug logging
LOG_LEVEL=DEBUG python insightforge_app.py
```

### Testing
```bash
# Run individual modules
python competitive_intelligence_scraper.py
python ai_competitive_analyzer.py
python enterprise_software_analyzer.py
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:5001/api/health

# Test preset groups
curl http://localhost:5001/api/preset-groups
```

## Troubleshooting

### Common Issues

1. **AI Analysis Not Working**
   - Check API keys in `.env` file
   - Verify API key validity and quotas
   - Check network connectivity

2. **Scraping Failures**
   - Verify target URLs are accessible
   - Check rate limiting settings
   - Review error logs for specific issues

3. **Import/Export Errors**
   - Verify file format compatibility
   - Check file permissions and paths
   - Review data structure requirements

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=DEBUG` in environment variables or running with debug mode enabled.

## Contributing

### Development Guidelines
- Follow PEP 8 coding standards
- Add comprehensive error handling
- Include logging for all operations
- Write clear documentation
- Add type hints for all functions

### Testing Requirements
- Test all API endpoints
- Verify error handling scenarios
- Test with various data formats
- Validate AI integration functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Review the documentation and examples
- Check the log files for error details
- Verify configuration and environment setup
- Review API endpoint documentation

---

**InsightForge Backend** - Transforming competitive intelligence from data collection to strategic advantage through the power of AI and advanced analytics. 