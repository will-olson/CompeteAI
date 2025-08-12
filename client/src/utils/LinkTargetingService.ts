export interface LinkTarget {
  company: string;
  category: string;
  url: string;
  priority: 'high' | 'medium' | 'low';
  source: string;
  description: string;
}

export interface CompanyProfile {
  name: string;
  domain: string;
  industry: string;
  subdomains: string[];
  socialProfiles: Record<string, string>;
  newsSources: string[];
  documentationPaths: string[];
  blogPaths: string[];
  apiPaths: string[];
}

class LinkTargetingService {
  private companyProfiles: Record<string, CompanyProfile> = {};
  private industryNewsSources: Record<string, string[]> = {};
  private technologyNewsSources: string[] = [];

  constructor() {
    this.initializeCompanyProfiles();
    this.initializeNewsSources();
  }

  private initializeCompanyProfiles() {
    // Tech SaaS Companies
    this.companyProfiles = {
      'Salesforce': {
        name: 'Salesforce',
        domain: 'salesforce.com',
        industry: 'tech-saas',
        subdomains: ['www', 'help', 'trailhead', 'developer', 'partners', 'appexchange'],
        socialProfiles: {
          twitter: 'https://twitter.com/salesforce',
          linkedin: 'https://linkedin.com/company/salesforce',
          facebook: 'https://facebook.com/salesforce',
          youtube: 'https://youtube.com/user/salesforce'
        },
        newsSources: ['https://www.salesforce.com/news/', 'https://www.salesforce.com/blog/'],
        documentationPaths: ['/docs', '/help', '/trailhead', '/developer/docs'],
        blogPaths: ['/blog', '/news', '/insights'],
        apiPaths: ['/developer/docs', '/api', '/rest']
      },
      'HubSpot': {
        name: 'HubSpot',
        domain: 'hubspot.com',
        industry: 'tech-saas',
        subdomains: ['www', 'developers', 'partners', 'academy', 'community'],
        socialProfiles: {
          twitter: 'https://twitter.com/HubSpot',
          linkedin: 'https://linkedin.com/company/hubspot',
          facebook: 'https://facebook.com/hubspot',
          youtube: 'https://youtube.com/user/hubspot'
        },
        newsSources: ['https://blog.hubspot.com/', 'https://www.hubspot.com/news/'],
        documentationPaths: ['/developers/docs', '/help', '/knowledge'],
        blogPaths: ['/blog', '/news', '/insights'],
        apiPaths: ['/developers/docs', '/api', '/integrations']
      },
      'Slack': {
        name: 'Slack',
        domain: 'slack.com',
        industry: 'tech-saas',
        subdomains: ['www', 'api', 'slackhq', 'get', 'a'],
        socialProfiles: {
          twitter: 'https://twitter.com/SlackHQ',
          linkedin: 'https://linkedin.com/company/slack-technologies',
          facebook: 'https://facebook.com/slackhq',
          youtube: 'https://youtube.com/user/slackhq'
        },
        newsSources: ['https://slack.com/blog/', 'https://slack.com/news/'],
        documentationPaths: ['/help', '/api', '/developers', '/docs'],
        blogPaths: ['/blog', '/news', '/updates'],
        apiPaths: ['/api', '/developers', '/integrations']
      },
      'Notion': {
        name: 'Notion',
        domain: 'notion.so',
        industry: 'tech-saas',
        subdomains: ['www', 'developers', 'help', 'community'],
        socialProfiles: {
          twitter: 'https://twitter.com/NotionHQ',
          linkedin: 'https://linkedin.com/company/notionhq',
          instagram: 'https://instagram.com/notionhq'
        },
        newsSources: ['https://www.notion.so/blog', 'https://www.notion.so/news'],
        documentationPaths: ['/help', '/developers', '/docs', '/guides'],
        blogPaths: ['/blog', '/news', '/updates'],
        apiPaths: ['/developers', '/api', '/integrations']
      },
      'Figma': {
        name: 'Figma',
        domain: 'figma.com',
        industry: 'tech-saas',
        subdomains: ['www', 'help', 'developers', 'community', 'plugins'],
        socialProfiles: {
          twitter: 'https://twitter.com/figma',
          linkedin: 'https://linkedin.com/company/figma',
          instagram: 'https://instagram.com/figma',
          youtube: 'https://youtube.com/user/figma'
        },
        newsSources: ['https://www.figma.com/blog/', 'https://www.figma.com/news/'],
        documentationPaths: ['/help', '/developers', '/docs', '/guides'],
        blogPaths: ['/blog', '/news', '/updates'],
        apiPaths: ['/developers', '/api', '/plugins']
      },
      'Airtable': {
        name: 'Airtable',
        domain: 'airtable.com',
        industry: 'tech-saas',
        subdomains: ['www', 'support', 'developers', 'community'],
        socialProfiles: {
          twitter: 'https://twitter.com/airtable',
          linkedin: 'https://linkedin.com/company/airtable',
          facebook: 'https://facebook.com/airtable',
          youtube: 'https://youtube.com/user/airtable'
        },
        newsSources: ['https://airtable.com/blog/', 'https://airtable.com/news/'],
        documentationPaths: ['/support', '/developers', '/docs', '/guides'],
        blogPaths: ['/blog', '/news', '/updates'],
        apiPaths: ['/developers', '/api', '/integrations']
      },
      'Stripe': {
        name: 'Stripe',
        domain: 'stripe.com',
        industry: 'fintech',
        subdomains: ['www', 'dashboard', 'docs', 'support', 'community'],
        socialProfiles: {
          twitter: 'https://twitter.com/stripe',
          linkedin: 'https://linkedin.com/company/stripe',
          facebook: 'https://facebook.com/stripe',
          youtube: 'https://youtube.com/user/stripe'
        },
        newsSources: ['https://stripe.com/blog/', 'https://stripe.com/news/'],
        documentationPaths: ['/docs', '/support', '/guides', '/tutorials'],
        blogPaths: ['/blog', '/news', '/insights'],
        apiPaths: ['/docs', '/api', '/integrations']
      },
      'OpenAI': {
        name: 'OpenAI',
        domain: 'openai.com',
        industry: 'ai-ml',
        subdomains: ['www', 'platform', 'docs', 'research', 'blog'],
        socialProfiles: {
          twitter: 'https://twitter.com/OpenAI',
          linkedin: 'https://linkedin.com/company/openai',
          youtube: 'https://youtube.com/user/OpenAI'
        },
        newsSources: ['https://openai.com/blog/', 'https://openai.com/research/'],
        documentationPaths: ['/docs', '/platform', '/api', '/guides'],
        blogPaths: ['/blog', '/research', '/updates'],
        apiPaths: ['/api', '/platform', '/docs']
      }
    };
  }

  private initializeNewsSources() {
    this.technologyNewsSources = [
      'https://techcrunch.com',
      'https://www.theverge.com',
      'https://www.wired.com',
      'https://www.engadget.com',
      'https://www.zdnet.com',
      'https://www.techradar.com',
      'https://www.cnet.com',
      'https://www.venturebeat.com',
      'https://www.techrepublic.com',
      'https://www.informationweek.com'
    ];

    this.industryNewsSources = {
      'tech-saas': [
        'https://www.saastr.com',
        'https://www.enterprisersproject.com',
        'https://www.cio.com',
        'https://www.techcrunch.com/tag/saas/',
        'https://www.zdnet.com/news/saas/'
      ],
      'fintech': [
        'https://www.fintechfutures.com',
        'https://www.fintechnews.org',
        'https://www.fintechweekly.com',
        'https://www.techcrunch.com/tag/fintech/',
        'https://www.zdnet.com/news/fintech/'
      ],
      'ai-ml': [
        'https://www.artificialintelligence-news.com',
        'https://www.machinelearningmastery.com',
        'https://www.kdnuggets.com',
        'https://www.techcrunch.com/tag/artificial-intelligence/',
        'https://www.zdnet.com/news/artificial-intelligence/'
      ],
      'ecommerce': [
        'https://www.digitalcommerce360.com',
        'https://www.ecommercetimes.com',
        'https://www.pymnts.com',
        'https://www.techcrunch.com/tag/ecommerce/',
        'https://www.zdnet.com/news/ecommerce/'
      ]
    };
  }

  generateLinkTargets(company: string, categories: string[]): LinkTarget[] {
    const profile = this.companyProfiles[company];
    if (!profile) {
      return this.generateGenericTargets(company, categories);
    }

    const targets: LinkTarget[] = [];
    
    categories.forEach(category => {
      switch (category) {
        case 'marketing':
          targets.push(...this.generateMarketingTargets(profile));
          break;
        case 'docs':
          targets.push(...this.generateDocumentationTargets(profile));
          break;
        case 'rss':
          targets.push(...this.generateRSSTargets(profile));
          break;
        case 'social':
          targets.push(...this.generateSocialTargets(profile));
          break;
        case 'news':
          targets.push(...this.generateNewsTargets(profile));
          break;
        case 'api':
          targets.push(...this.generateAPITargets(profile));
          break;
        case 'community':
          targets.push(...this.generateCommunityTargets(profile));
          break;
        case 'careers':
          targets.push(...this.generateCareerTargets(profile));
          break;
        case 'investors':
          targets.push(...this.generateInvestorTargets(profile));
          break;
        case 'press':
          targets.push(...this.generatePressTargets(profile));
          break;
      }
    });

    return targets;
  }

  private generateMarketingTargets(profile: CompanyProfile): LinkTarget[] {
    const targets: LinkTarget[] = [];
    
    // Main marketing pages
    targets.push({
      company: profile.name,
      category: 'marketing',
      url: `https://www.${profile.domain}`,
      priority: 'high',
      source: 'main-website',
      description: 'Main company website'
    });

    // Product pages
    targets.push({
      company: profile.name,
      category: 'marketing',
      url: `https://www.${profile.domain}/products`,
      priority: 'high',
      source: 'product-pages',
      description: 'Product information pages'
    });

    // Pricing pages
    targets.push({
      company: profile.name,
      category: 'marketing',
      url: `https://www.${profile.domain}/pricing`,
      priority: 'high',
      source: 'pricing-pages',
      description: 'Pricing and plans information'
    });

    // Features pages
    targets.push({
      company: profile.name,
      category: 'marketing',
      url: `https://www.${profile.domain}/features`,
      priority: 'medium',
      source: 'feature-pages',
      description: 'Product features and capabilities'
    });

    // About pages
    targets.push({
      company: profile.name,
      category: 'marketing',
      url: `https://www.${profile.domain}/about`,
      priority: 'medium',
      source: 'about-pages',
      description: 'Company information and story'
    });

    // Blog and content
    profile.blogPaths.forEach(path => {
      targets.push({
        company: profile.name,
        category: 'marketing',
        url: `https://www.${profile.domain}${path}`,
        priority: 'medium',
        source: 'blog-content',
        description: 'Company blog and content marketing'
      });
    });

    return targets;
  }

  private generateDocumentationTargets(profile: CompanyProfile): LinkTarget[] {
    const targets: LinkTarget[] = [];
    
    // Main documentation
    profile.documentationPaths.forEach(path => {
      targets.push({
        company: profile.name,
        category: 'docs',
        url: `https://www.${profile.domain}${path}`,
        priority: 'high',
        source: 'documentation',
        description: 'Product documentation and guides'
      });
    });

    // API documentation
    profile.apiPaths.forEach(path => {
      targets.push({
        company: profile.name,
        category: 'docs',
        url: `https://www.${profile.domain}${path}`,
        priority: 'high',
        source: 'api-docs',
        description: 'API documentation and integration guides'
      });
    });

    // Developer resources
    targets.push({
      company: profile.name,
      category: 'docs',
      url: `https://developers.${profile.domain}`,
      priority: 'medium',
      source: 'developer-portal',
      description: 'Developer portal and resources'
    });

    // Help and support
    targets.push({
      company: profile.name,
      category: 'docs',
      url: `https://help.${profile.domain}`,
      priority: 'medium',
      source: 'help-support',
      description: 'Help center and support documentation'
    });

    return targets;
  }

  private generateRSSTargets(profile: CompanyProfile): LinkTarget[] {
    const targets: LinkTarget[] = [];
    
    // Main RSS feeds
    targets.push({
      company: profile.name,
      category: 'rss',
      url: `https://www.${profile.domain}/feed`,
      priority: 'high',
      source: 'main-rss',
      description: 'Main company RSS feed'
    });

    // Blog RSS feeds
    profile.blogPaths.forEach(path => {
      targets.push({
        company: profile.name,
        category: 'rss',
        url: `https://www.${profile.domain}${path}/feed`,
        priority: 'medium',
        source: 'blog-rss',
        description: 'Blog RSS feed'
      });
    });

    // News RSS feeds
    profile.newsSources.forEach(source => {
      if (source.includes(profile.domain)) {
        targets.push({
          company: profile.name,
          category: 'rss',
          url: `${source}/feed`,
          priority: 'medium',
          source: 'news-rss',
          description: 'News RSS feed'
        });
      }
    });

    return targets;
  }

  private generateSocialTargets(profile: CompanyProfile): LinkTarget[] {
    const targets: LinkTarget[] = [];
    
    // Social media profiles
    Object.entries(profile.socialProfiles).forEach(([platform, url]) => {
      targets.push({
        company: profile.name,
        category: 'social',
        url,
        priority: 'high',
        source: `${platform}-profile`,
        description: `${platform} social media profile`
      });
    });

    // Social media activity (search results)
    Object.entries(profile.socialProfiles).forEach(([platform, url]) => {
      if (platform === 'twitter') {
        targets.push({
          company: profile.name,
          category: 'social',
          url: `https://twitter.com/search?q=from:${url.split('/').pop()}&src=typed_query&f=live`,
          priority: 'medium',
          source: `${platform}-activity`,
          description: `${platform} recent activity and mentions`
        });
      }
    });

    return targets;
  }

  private generateNewsTargets(profile: CompanyProfile): LinkTarget[] {
    const targets: LinkTarget[] = [];
    
    // Company news sources
    profile.newsSources.forEach(source => {
      targets.push({
        company: profile.name,
        category: 'news',
        url: source,
        priority: 'medium',
        source: 'company-news',
        description: 'Company news and announcements'
      });
    });

    // Industry news sources
    const industrySources = this.industryNewsSources[profile.industry as keyof typeof this.industryNewsSources] || [];
    industrySources.forEach(source => {
      targets.push({
        company: profile.name,
        category: 'news',
        url: source,
        priority: 'low',
        source: 'industry-news',
        description: 'Industry news and trends'
      });
    });

    // Technology news sources
    this.technologyNewsSources.forEach(source => {
      targets.push({
        company: profile.name,
        category: 'news',
        url: source,
        priority: 'low',
        source: 'tech-news',
        description: 'Technology industry news'
      });
    });

    return targets;
  }

  private generateAPITargets(profile: CompanyProfile): LinkTarget[] {
    const targets: LinkTarget[] = [];
    
    // API documentation
    profile.apiPaths.forEach(path => {
      targets.push({
        company: profile.name,
        category: 'api',
        url: `https://www.${profile.domain}${path}`,
        priority: 'high',
        source: 'api-docs',
        description: 'API documentation and reference'
      });
    });

    // Developer portal
    targets.push({
      company: profile.name,
      category: 'api',
      url: `https://developers.${profile.domain}`,
      priority: 'high',
      source: 'developer-portal',
      description: 'Developer portal and resources'
    });

    // API status and health
    targets.push({
      company: profile.name,
      category: 'api',
      url: `https://status.${profile.domain}`,
      priority: 'medium',
      source: 'api-status',
      description: 'API status and system health'
    });

    return targets;
  }

  private generateCommunityTargets(profile: CompanyProfile): LinkTarget[] {
    const targets: LinkTarget[] = [];
    
    // Community forums
    targets.push({
      company: profile.name,
      category: 'community',
      url: `https://community.${profile.domain}`,
      priority: 'medium',
      source: 'community-forum',
      description: 'Community forum and discussions'
    });

    // Community pages
    targets.push({
      company: profile.name,
      category: 'community',
      url: `https://www.${profile.domain}/community`,
      priority: 'medium',
      source: 'community-pages',
      description: 'Community information and resources'
    });

    return targets;
  }

  private generateCareerTargets(profile: CompanyProfile): LinkTarget[] {
    const targets: LinkTarget[] = [];
    
    // Careers page
    targets.push({
      company: profile.name,
      category: 'careers',
      url: `https://www.${profile.domain}/careers`,
      priority: 'medium',
      source: 'careers-page',
      description: 'Job openings and company culture'
    });

    // Jobs page
    targets.push({
      company: profile.name,
      category: 'careers',
      url: `https://www.${profile.domain}/jobs`,
      priority: 'medium',
      source: 'jobs-page',
      description: 'Current job openings'
    });

    return targets;
  }

  private generateInvestorTargets(profile: CompanyProfile): LinkTarget[] {
    const targets: LinkTarget[] = [];
    
    // Investors page
    targets.push({
      company: profile.name,
      category: 'investors',
      url: `https://www.${profile.domain}/investors`,
      priority: 'low',
      source: 'investors-page',
      description: 'Investor relations and financial information'
    });

    // Press releases
    targets.push({
      company: profile.name,
      category: 'investors',
      url: `https://www.${profile.domain}/press`,
      priority: 'low',
      source: 'press-releases',
      description: 'Press releases and announcements'
    });

    return targets;
  }

  private generatePressTargets(profile: CompanyProfile): LinkTarget[] {
    const targets: LinkTarget[] = [];
    
    // Press page
    targets.push({
      company: profile.name,
      category: 'press',
      url: `https://www.${profile.domain}/press`,
      priority: 'medium',
      source: 'press-page',
      description: 'Press kit and media resources'
    });

    // Newsroom
    targets.push({
      company: profile.name,
      category: 'press',
      url: `https://www.${profile.domain}/newsroom`,
      priority: 'medium',
      source: 'newsroom',
      description: 'Company newsroom and press releases'
    });

    return targets;
  }

  private generateGenericTargets(company: string, categories: string[]): LinkTarget[] {
    const targets: LinkTarget[] = [];
    
    // Try to guess domain from company name
    const possibleDomains = [
      `${company.toLowerCase()}.com`,
      `${company.toLowerCase()}.org`,
      `${company.toLowerCase()}.net`,
      `www.${company.toLowerCase()}.com`
    ];

    categories.forEach(category => {
      possibleDomains.forEach(domain => {
        targets.push({
          company,
          category,
          url: `https://${domain}`,
          priority: 'medium',
          source: 'generic-guess',
          description: 'Generic domain guess'
        });

        if (category === 'docs') {
          targets.push({
            company,
            category,
            url: `https://docs.${domain.replace('www.', '')}`,
            priority: 'medium',
            source: 'generic-docs',
            description: 'Generic documentation domain guess'
          });
        }
      });
    });

    return targets;
  }

  getCompanyProfile(company: string): CompanyProfile | undefined {
    return this.companyProfiles[company];
  }

  getAllCompanyProfiles(): CompanyProfile[] {
    return Object.values(this.companyProfiles);
  }

  getIndustryNewsSources(industry: string): string[] {
    return this.industryNewsSources[industry] || [];
  }

  getTechnologyNewsSources(): string[] {
    return this.technologyNewsSources;
  }
}

export const linkTargetingService = new LinkTargetingService(); 