// demoDataGenerator.ts - Utility for generating demo data for testing
import { ScrapedItem } from '@/state/ScrapeStore';

const genId = () => Math.random().toString(36).slice(2);

export const generateDemoData = (): ScrapedItem[] => {
  const companies = ['Salesforce', 'HubSpot', 'Stripe', 'OpenAI', 'Shopify'];
  const categories = ['marketing', 'docs', 'rss', 'social'] as const;
  const demoItems: ScrapedItem[] = [];

  companies.forEach((company, companyIndex) => {
    categories.forEach((category, categoryIndex) => {
      for (let i = 0; i < 3; i++) {
        const item: ScrapedItem = {
          id: genId(),
          company,
          category,
          url: `https://${company.toLowerCase()}.com/${category}/${i + 1}`,
          title: `${company} - ${category.charAt(0).toUpperCase() + category.slice(1)} Page ${i + 1}`,
          markdown: generateDemoContent(company, category, i + 1),
          html: `<h1>${company} - ${category.charAt(0).toUpperCase() + category.slice(1)} Page ${i + 1}</h1>`,
          scrapedAt: new Date(Date.now() - (companyIndex * 86400000) - (categoryIndex * 3600000)).toISOString(),
          source: `${company.toLowerCase()}.com`
        };
        demoItems.push(item);
      }
    });
  });

  return demoItems;
};

const generateDemoContent = (company: string, category: string, pageNum: number): string => {
  const contentTemplates = {
    marketing: [
      `# ${company} - Marketing Excellence\n\nDiscover how ${company} transforms businesses through innovative marketing solutions.\n\n## Key Benefits\n- **Increased ROI**: Average 300% improvement in marketing efficiency\n- **Better Targeting**: AI-powered audience segmentation\n- **Automation**: Streamlined workflows that save 20+ hours per week\n\n## Customer Success\nOur clients have achieved remarkable results:\n\n\`\`\`\nConversion Rate: +45%\nCustomer Acquisition Cost: -30%\nRevenue Growth: +150%\n\`\`\`\n\n## Get Started\nReady to transform your marketing? [Contact our team](mailto:sales@${company.toLowerCase()}.com) today!`,
      
      `# ${company} Marketing Solutions\n\nRevolutionary marketing technology that drives real business results.\n\n## Features\n- **Multi-channel Campaigns**: Reach customers everywhere\n- **Advanced Analytics**: Deep insights into performance\n- **Personalization**: Tailored experiences for every user\n\n## Industry Recognition\n- Gartner Magic Quadrant Leader\n- Forrester Wave Top Performer\n- Customer Choice Award Winner\n\n## Pricing\nStarting at $99/month for small businesses. [View pricing](https://${company.toLowerCase()}.com/pricing)`,
      
      `# ${company} Marketing Platform\n\nEnterprise-grade marketing automation for modern businesses.\n\n## Why Choose ${company}?\n1. **Scalability**: Handles millions of contacts\n2. **Integration**: Works with your existing tools\n3. **Support**: 24/7 expert assistance\n\n## Technical Specifications\n- API-first architecture\n- 99.9% uptime guarantee\n- SOC 2 Type II compliant\n- GDPR compliant\n\n## Resources\n- [Documentation](https://docs.${company.toLowerCase()}.com)\n- [API Reference](https://api.${company.toLowerCase()}.com)\n- [Community](https://community.${company.toLowerCase()}.com)`
    ],
    
    docs: [
      `# ${company} API Documentation\n\nComplete reference for integrating with the ${company} platform.\n\n## Authentication\n\`\`\`javascript\nconst client = new ${company}Client({\n  apiKey: 'your-api-key',\n  environment: 'production'\n});\n\`\`\`\n\n## Endpoints\n### GET /api/v1/users\nRetrieve user information\n\n**Parameters:**\n- \`id\` (string): User ID\n- \`email\` (string): User email\n\n**Response:**\n\`\`\`json\n{\n  "id": "user_123",\n  "email": "user@example.com",\n  "name": "John Doe"\n}\n\`\`\``,
      
      `# ${company} Integration Guide\n\nStep-by-step instructions for connecting ${company} with your systems.\n\n## Prerequisites\n- Valid API key\n- Node.js 16+ or Python 3.8+\n- HTTPS endpoint for webhooks\n\n## Quick Start\n1. **Install SDK**: \`npm install @${company.toLowerCase()}/sdk\`\n2. **Initialize Client**: Configure with your API key\n3. **Make First Call**: Test the connection\n4. **Set Up Webhooks**: Handle real-time events\n\n## Best Practices\n- Use environment variables for API keys\n- Implement proper error handling\n- Set up monitoring and alerting\n- Follow rate limiting guidelines`,
      
      `# ${company} Developer Resources\n\nEverything you need to build with ${company}.\n\n## SDKs & Libraries\n- **JavaScript/Node.js**: Official npm package\n- **Python**: PyPI package with full type hints\n- **Java**: Maven repository integration\n- **Go**: Go modules support\n\n## Code Examples\n\`\`\`python\nimport ${company.lower()}\n\nclient = ${company.lower()}.Client(api_key="your-key")\nusers = client.users.list(limit=100)\nfor user in users:\n    print(f"User: {user.name}")\n\`\`\`\n\n## Support\n- [Developer Forum](https://dev.${company.toLowerCase()}.com)\n- [GitHub Issues](https://github.com/${company.toLowerCase()}/sdk)\n- [Email Support](mailto:dev-support@${company.toLowerCase()}.com)`
    ],
    
    rss: [
      `# ${company} Product Updates - Q4 2024\n\nExciting new features and improvements coming to the ${company} platform.\n\n## New Features\n- **Advanced Analytics Dashboard**: Real-time insights and reporting\n- **AI-Powered Recommendations**: Machine learning suggestions\n- **Enhanced Mobile App**: Native iOS and Android applications\n\n## Performance Improvements\n- 50% faster page load times\n- Improved API response times\n- Better database query optimization\n\n## What's Next\nStay tuned for more announcements in the coming weeks. Follow our [blog](https://${company.toLowerCase()}.com/blog) for updates!`,
      
      `# ${company} Industry Insights\n\nLatest trends and analysis from the ${company} research team.\n\n## Market Analysis\n- **Digital Transformation**: 78% of companies accelerating digital initiatives\n- **AI Adoption**: 65% increase in AI implementation\n- **Remote Work**: 89% of employees prefer hybrid models\n\n## Customer Stories\n- Enterprise Corp: 300% ROI improvement\n- Startup Inc: 50% faster time to market\n- Global Ltd: 25% cost reduction\n\n## Expert Opinions\nOur industry experts share their insights on emerging trends and best practices.`,
      
      `# ${company} Community Highlights\n\nCelebrating the amazing contributions from our user community.\n\n## Featured Projects\n- **Integration Templates**: Pre-built connectors for popular tools\n- **Custom Dashboards**: User-created analytics views\n- **API Wrappers**: Language-specific client libraries\n\n## Community Events\n- Monthly virtual meetups\n- Annual developer conference\n- Regional user groups\n\n## Get Involved\nJoin our [community forum](https://community.${company.toLowerCase()}.com) and share your projects!`
    ],
    
    social: [
      `# ${company} Social Media Strategy\n\nBuilding meaningful connections with customers across social platforms.\n\n## Platform Presence\n- **LinkedIn**: Professional networking and thought leadership\n- **Twitter**: Real-time updates and customer support\n- **YouTube**: Educational content and product demos\n- **Instagram**: Behind-the-scenes and company culture\n\n## Content Strategy\n- Daily industry insights\n- Weekly product tips\n- Monthly customer spotlights\n- Quarterly company updates\n\n## Engagement Metrics\n- 500K+ followers across platforms\n- 95% positive sentiment\n- 2M+ monthly impressions\n- 15% engagement rate`,
      
      `# ${company} Social Impact\n\nMaking a difference in our communities and the world.\n\n## Corporate Social Responsibility\n- **Environmental**: Carbon-neutral operations by 2025\n- **Social**: 50% diverse leadership by 2026\n- **Governance**: Transparent reporting and accountability\n\n## Community Programs\n- STEM education initiatives\n- Local business support\n- Employee volunteer programs\n- Charitable giving campaigns\n\n## Sustainability Goals\n- 100% renewable energy\n- Zero waste operations\n- Ethical supply chain\n- Green product design`,
      
      `# ${company} Social Innovation\n\nLeveraging social media for product development and customer insights.\n\n## Social Listening\n- Monitor brand mentions and sentiment\n- Identify trending topics and opportunities\n- Gather customer feedback and suggestions\n- Track competitor activities\n\n## Social Commerce\n- Direct product discovery\n- Influencer partnerships\n- User-generated content\n- Social proof and testimonials\n\n## Future Vision\nBuilding the most customer-centric platform through social intelligence and community engagement.`
    ]
  };

  const template = contentTemplates[category as keyof typeof contentTemplates];
  return template[pageNum % template.length] || template[0];
};

export const generateQuickDemo = (): ScrapedItem[] => {
  return [
    {
      id: genId(),
      company: 'Demo Corp',
      category: 'marketing',
      url: 'https://demo.com/marketing',
      title: 'Demo Marketing Page',
      markdown: '# Demo Marketing Page\n\nThis is a demo page to test the dashboard functionality.\n\n## Features\n- Sample content\n- Mock data\n- Testing capabilities\n\n## Next Steps\nTry scraping some real URLs or import files to see the full functionality!',
      html: '<h1>Demo Marketing Page</h1>',
      scrapedAt: new Date().toISOString(),
      source: 'demo.com'
    }
  ];
}; 