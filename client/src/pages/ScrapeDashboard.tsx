import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { APIService } from '@/utils/APIService';
import { ScrapedItem, useScrapeStore } from '@/state/ScrapeStore';
import { SEO } from '@/components/SEO';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, AreaChart, Area } from 'recharts';
import Papa from 'papaparse';
import mammoth from 'mammoth';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Activity, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Users, Building2, Target, Plus, Trash2, Server, Wifi, WifiOff, Globe, FileText, Rss, MessageCircle, Settings, Play, Filter, Brain, Zap, Lightbulb, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { databaseService, DatabaseItem } from '@/utils/DatabaseService';
import { aiService, AIAnalysisResult } from '@/utils/AIService';
import { linkTargetingService, LinkTarget } from '@/utils/LinkTargetingService';

const genId = () => Math.random().toString(36).slice(2);

// Dynamic industry groupings using LinkTargetingService
const getIndustryGroupings = () => {
  const profiles = linkTargetingService.getAllCompanyProfiles();
  const groupings: Record<string, { name: string; companies: string[]; categories: string[]; description: string; linkPatterns: Record<string, string[]>; subcategoryPatterns?: Record<string, Record<string, string[]>>; regionalPatterns?: Record<string, string[]> }> = {};
  
  // Enhanced preset groups with comprehensive link patterns
  const enhancedGroupings = {
    'tech-saas': {
      name: 'Tech SaaS Companies',
      companies: ['OpenAI', 'Stripe', 'Notion', 'Figma', 'Linear', 'Vercel', 'Supabase', 'PlanetScale', 'GitHub', 'GitLab', 'Atlassian', 'Slack', 'Discord', 'Zoom', 'Dropbox', 'Box', 'Salesforce', 'HubSpot', 'Intercom', 'Zendesk'],
      categories: ['marketing', 'docs', 'api', 'blog', 'community', 'pricing', 'security', 'enterprise', 'partners', 'developers', 'support', 'resources'],
      description: 'Software-as-a-Service companies with developer-focused content and comprehensive business solutions',
      linkPatterns: {
        marketing: ['', '/features', '/pricing', '/about', '/customers', '/security', '/solutions', '/use-cases', '/case-studies', '/testimonials', '/brand', '/press', '/careers'],
        docs: ['/docs', '/help', '/guides', '/tutorials', '/api', '/reference', '/examples', '/quickstart', '/getting-started', '/best-practices', '/troubleshooting', '/faq'],
        api: ['/api', '/docs/api', '/developers', '/integrations', '/sdk', '/libraries', '/tools', '/playground', '/console', '/endpoints', '/webhooks', '/rate-limits'],
        blog: ['/blog', '/news', '/updates', '/changelog', '/insights', '/engineering', '/design', '/product', '/company', '/announcements', '/releases', '/roadmap'],
        community: ['/community', '/forum', '/discussions', '/support', '/help-center', '/knowledge-base', '/tutorials', '/showcase', '/gallery', '/examples', '/templates'],
        pricing: ['/pricing', '/plans', '/billing', '/subscriptions', '/enterprise', '/custom', '/quote', '/calculator', '/comparison', '/tiers'],
        security: ['/security', '/trust', '/compliance', '/privacy', '/gdpr', '/soc2', '/iso27001', '/certifications', '/audit', '/penetration-testing'],
        enterprise: ['/enterprise', '/business', '/teams', '/organizations', '/admin', '/governance', '/scalability', '/enterprise-features'],
        partners: ['/partners', '/resellers', '/affiliates', '/marketplace', '/integrations', '/ecosystem', '/certified-partners'],
        developers: ['/developers', '/dev', '/engineering', '/tech', '/architecture', '/infrastructure', '/deployment', '/ci-cd'],
        support: ['/support', '/help', '/contact', '/tickets', '/chat', '/phone', '/email', '/status', '/outages'],
        resources: ['/resources', '/downloads', '/templates', '/assets', '/media', '/videos', '/webinars', '/events', '/training']
      },
      subcategoryPatterns: {
        marketing: {
          features: ['/features', '/capabilities', '/functionality', '/tools', '/products'],
          pricing: ['/pricing', '/plans', '/cost', '/billing', '/subscriptions'],
          customers: ['/customers', '/case-studies', '/success-stories', '/testimonials', '/reviews'],
          solutions: ['/solutions', '/use-cases', '/industries', '/departments', '/workflows']
        },
        docs: {
          api: ['/docs/api', '/api-reference', '/endpoints', '/authentication', '/examples'],
          guides: ['/guides', '/tutorials', '/how-to', '/walkthroughs', '/step-by-step'],
          best_practices: ['/best-practices', '/recommendations', '/tips', '/guidelines', '/standards']
        },
        api: {
          authentication: ['/auth', '/authentication', '/oauth', '/jwt', '/api-keys'],
          webhooks: ['/webhooks', '/events', '/notifications', '/callbacks', '/triggers'],
          rate_limits: ['/rate-limits', '/quotas', '/throttling', '/limits', '/policies']
        }
      },
      regionalPatterns: {
        'en-us': ['', '/us', '/en', '/en-us'],
        'en-gb': ['/uk', '/en-gb', '/gb'],
        'de': ['/de', '/de-de', '/german'],
        'fr': ['/fr', '/fr-fr', '/french'],
        'es': ['/es', '/es-es', '/spanish'],
        'ja': ['/jp', '/ja-jp', '/japanese'],
        'zh': ['/cn', '/zh-cn', '/chinese']
      }
    },
    'fintech': {
      name: 'Fintech & Payments',
      companies: ['Stripe', 'Plaid', 'Square', 'Coinbase', 'Robinhood', 'Chime', 'Affirm', 'Klarna', 'PayPal', 'Venmo', 'Wise', 'Revolut', 'Monzo', 'N26', 'Brex', 'Ramp', 'Bill.com', 'QuickBooks', 'Xero', 'FreshBooks'],
      categories: ['marketing', 'docs', 'api', 'compliance', 'security', 'pricing', 'enterprise', 'partners', 'developers', 'support', 'resources', 'compliance'],
      description: 'Financial technology and payment processing companies with regulatory compliance focus',
      linkPatterns: {
        marketing: ['', '/solutions', '/pricing', '/enterprise', '/partners', '/features', '/benefits', '/use-cases', '/industries', '/case-studies', '/testimonials', '/press', '/about'],
        docs: ['/docs', '/guides', '/api', '/support', '/knowledge-base', '/tutorials', '/examples', '/quickstart', '/getting-started', '/best-practices', '/faq', '/help'],
        api: ['/api', '/docs/api', '/developers', '/integrations', '/webhooks', '/sdk', '/libraries', '/tools', '/playground', '/console', '/endpoints', '/authentication'],
        compliance: ['/compliance', '/security', '/privacy', '/regulatory', '/audit', '/certifications', '/standards', '/policies', '/procedures', '/training', '/gdpr', '/ccpa'],
        security: ['/security', '/trust', '/compliance', '/certifications', '/audit', '/penetration-testing', '/vulnerability-disclosure', '/bug-bounty', '/security-practices'],
        pricing: ['/pricing', '/plans', '/fees', '/rates', '/transactions', '/subscriptions', '/enterprise', '/custom', '/quote', '/calculator', '/comparison'],
        enterprise: ['/enterprise', '/business', '/corporate', '/institutions', '/banks', '/credit-unions', '/insurance', '/wealth-management', '/enterprise-features'],
        partners: ['/partners', '/resellers', '/affiliates', '/marketplace', '/integrations', '/ecosystem', '/certified-partners', '/referral-program'],
        developers: ['/developers', '/dev', '/engineering', '/tech', '/architecture', '/infrastructure', '/deployment', '/ci-cd', '/testing', '/debugging'],
        support: ['/support', '/help', '/contact', '/tickets', '/chat', '/phone', '/email', '/status', '/outages', '/emergency'],
        resources: ['/resources', '/downloads', '/templates', '/assets', '/media', '/videos', '/webinars', '/events', '/training', '/certification']
      },
      subcategoryPatterns: {
        compliance: {
          regulatory: ['/regulatory', '/regulations', '/compliance-requirements', '/legal', '/law'],
          audit: ['/audit', '/auditing', '/compliance-audit', '/internal-audit', '/external-audit'],
          certifications: ['/certifications', '/certified', '/accreditation', '/standards', '/iso']
        },
        security: {
          authentication: ['/auth', '/authentication', '/2fa', '/mfa', '/biometric', '/identity-verification'],
          encryption: ['/encryption', '/encrypted', '/ssl', '/tls', '/pki', '/key-management'],
          monitoring: ['/monitoring', '/alerts', '/fraud-detection', '/anomaly-detection', '/threat-intelligence']
        }
      },
      regionalPatterns: {
        'en-us': ['', '/us', '/en', '/en-us'],
        'en-gb': ['/uk', '/en-gb', '/gb'],
        'eu': ['/eu', '/europe', '/european'],
        'ca': ['/ca', '/canada', '/en-ca'],
        'au': ['/au', '/australia', '/en-au']
      }
    },
    'ai-ml': {
      name: 'AI & Machine Learning',
      companies: ['OpenAI', 'Anthropic', 'Google AI', 'Microsoft AI', 'Hugging Face', 'Stability AI', 'Cohere', 'Scale AI', 'DataRobot', 'H2O.ai', 'Databricks', 'Snowflake', 'Palantir', 'C3.ai', 'UiPath', 'Automation Anywhere', 'Blue Prism', 'IBM Watson', 'Amazon SageMaker', 'Azure ML'],
      categories: ['marketing', 'docs', 'api', 'research', 'models', 'pricing', 'enterprise', 'partners', 'developers', 'support', 'resources', 'ethics'],
      description: 'Artificial intelligence and machine learning companies with research and model focus',
      linkPatterns: {
        marketing: ['', '/products', '/solutions', '/enterprise', '/research', '/features', '/capabilities', '/use-cases', '/industries', '/case-studies', '/testimonials', '/press', '/about'],
        docs: ['/docs', '/guides', '/tutorials', '/examples', '/best-practices', '/api', '/reference', '/quickstart', '/getting-started', '/troubleshooting', '/faq', '/help'],
        api: ['/api', '/docs/api', '/playground', '/models', '/endpoints', '/authentication', '/rate-limits', '/webhooks', '/sdk', '/libraries', '/tools', '/console'],
        research: ['/research', '/papers', '/blog', '/publications', '/insights', '/whitepapers', '/reports', '/studies', '/findings', '/methodology', '/experiments'],
        models: ['/models', '/gallery', '/showcase', '/examples', '/benchmarks', '/performance', '/comparison', '/evaluation', '/metrics', '/leaderboard'],
        pricing: ['/pricing', '/plans', '/cost', '/billing', '/subscriptions', '/enterprise', '/custom', '/quote', '/calculator', '/comparison', '/tiers'],
        enterprise: ['/enterprise', '/business', '/corporate', '/industries', '/solutions', '/consulting', '/professional-services', '/training', '/support'],
        partners: ['/partners', '/resellers', '/affiliates', '/marketplace', '/integrations', '/ecosystem', '/certified-partners', '/referral-program'],
        developers: ['/developers', '/dev', '/engineering', '/tech', '/architecture', '/infrastructure', '/deployment', '/ci-cd', '/testing', '/debugging'],
        support: ['/support', '/help', '/contact', '/tickets', '/chat', '/phone', '/email', '/status', '/outages', '/emergency'],
        resources: ['/resources', '/downloads', '/templates', '/assets', '/media', '/videos', '/webinars', '/events', '/training', '/certification'],
        ethics: ['/ethics', '/responsible-ai', '/fairness', '/transparency', '/accountability', '/safety', '/alignment', '/governance', '/policies']
      },
      subcategoryPatterns: {
        models: {
          performance: ['/performance', '/benchmarks', '/metrics', '/evaluation', '/comparison', '/leaderboard'],
          deployment: ['/deployment', '/inference', '/serving', '/scaling', '/optimization', '/production'],
          training: ['/training', '/fine-tuning', '/transfer-learning', '/data-preparation', '/hyperparameter-tuning']
        },
        research: {
          papers: ['/papers', '/publications', '/research-papers', '/academic', '/conferences', '/journals'],
          blog: ['/blog', '/research-blog', '/technical-blog', '/engineering-blog', '/insights', '/updates']
        }
      },
      regionalPatterns: {
        'en-us': ['', '/us', '/en', '/en-us'],
        'en-gb': ['/uk', '/en-gb', '/gb'],
        'eu': ['/eu', '/europe', '/european'],
        'ca': ['/ca', '/canada', '/en-ca'],
        'au': ['/au', '/australia', '/en-au']
      }
    },
    'ecommerce': {
      name: 'E-commerce & Retail',
      companies: ['Shopify', 'WooCommerce', 'BigCommerce', 'Magento', 'Salesforce Commerce', 'Adobe Commerce', 'Squarespace', 'Wix', 'Squarespace', 'Webflow', 'Framer', 'Bubble', 'Zapier', 'Make', 'n8n', 'Retool', 'Airtable', 'Notion', 'Coda', 'Figma'],
      categories: ['marketing', 'docs', 'api', 'templates', 'apps', 'pricing', 'enterprise', 'partners', 'developers', 'support', 'resources', 'showcase'],
      description: 'E-commerce platforms and retail technology with template and app ecosystem focus',
      linkPatterns: {
        marketing: ['', '/features', '/pricing', '/templates', '/showcase', '/solutions', '/use-cases', '/industries', '/case-studies', '/testimonials', '/press', '/about'],
        docs: ['/docs', '/guides', '/tutorials', '/api', '/reference', '/examples', '/quickstart', '/getting-started', '/best-practices', '/troubleshooting', '/faq', '/help'],
        api: ['/api', '/docs/api', '/webhooks', '/integrations', '/apps', '/sdk', '/libraries', '/tools', '/playground', '/console', '/endpoints', '/authentication'],
        templates: ['/templates', '/themes', '/designs', '/showcase', '/examples', '/gallery', '/marketplace', '/store', '/downloads', '/premium', '/free'],
        apps: ['/apps', '/extensions', '/plugins', '/integrations', '/marketplace', '/store', '/ecosystem', '/partners', '/developers', '/api'],
        pricing: ['/pricing', '/plans', '/cost', '/billing', '/subscriptions', '/enterprise', '/custom', '/quote', '/calculator', '/comparison', '/tiers'],
        enterprise: ['/enterprise', '/business', '/corporate', '/industries', '/solutions', '/consulting', '/professional-services', '/training', '/support'],
        partners: ['/partners', '/resellers', '/affiliates', '/marketplace', '/integrations', '/ecosystem', '/certified-partners', '/referral-program'],
        developers: ['/developers', '/dev', '/engineering', '/tech', '/architecture', '/infrastructure', '/deployment', '/ci-cd', '/testing', '/debugging'],
        support: ['/support', '/help', '/contact', '/tickets', '/chat', '/phone', '/email', '/status', '/outages', '/emergency'],
        resources: ['/resources', '/downloads', '/templates', '/assets', '/media', '/videos', '/webinars', '/events', '/training', '/certification'],
        showcase: ['/showcase', '/gallery', '/examples', '/case-studies', '/success-stories', '/portfolio', '/work', '/projects', '/demos']
      },
      subcategoryPatterns: {
        templates: {
          themes: ['/themes', '/designs', '/layouts', '/styles', '/customization'],
          marketplace: ['/marketplace', '/store', '/shop', '/gallery', '/browse'],
          premium: ['/premium', '/paid', '/professional', '/enterprise', '/custom']
        },
        apps: {
          extensions: ['/extensions', '/plugins', '/add-ons', '/modules', '/components'],
          integrations: ['/integrations', '/connectors', '/bridges', '/sync', '/automation'],
          marketplace: ['/marketplace', '/store', '/app-store', '/gallery', '/browse']
        }
      },
      regionalPatterns: {
        'en-us': ['', '/us', '/en', '/en-us'],
        'en-gb': ['/uk', '/en-gb', '/gb'],
        'eu': ['/eu', '/europe', '/european'],
        'ca': ['/ca', '/canada', '/en-ca'],
        'au': ['/au', '/australia', '/en-au']
      }
    },
    'developer-tools': {
      name: 'Developer Tools',
      companies: ['GitHub', 'GitLab', 'Bitbucket', 'JetBrains', 'VS Code', 'Postman', 'Docker', 'Kubernetes', 'HashiCorp', 'CircleCI', 'Jenkins', 'Travis CI', 'GitHub Actions', 'GitLab CI', 'Bitbucket Pipelines', 'AWS', 'Google Cloud', 'Azure', 'DigitalOcean', 'Heroku'],
      categories: ['marketing', 'docs', 'api', 'downloads', 'community', 'pricing', 'enterprise', 'partners', 'developers', 'support', 'resources', 'integrations'],
      description: 'Tools and platforms for software developers with comprehensive development workflows',
      linkPatterns: {
        marketing: ['', '/features', '/pricing', '/enterprise', '/teams', '/solutions', '/use-cases', '/industries', '/case-studies', '/testimonials', '/press', '/about'],
        docs: ['/docs', '/guides', '/tutorials', '/api', '/reference', '/examples', '/quickstart', '/getting-started', '/best-practices', '/troubleshooting', '/faq', '/help'],
        api: ['/api', '/docs/api', '/webhooks', '/integrations', '/sdk', '/libraries', '/tools', '/playground', '/console', '/endpoints', '/authentication', '/rate-limits'],
        downloads: ['/download', '/releases', '/versions', '/changelog', '/updates', '/beta', '/alpha', '/nightly', '/canary', '/preview', '/stable'],
        community: ['/community', '/forum', '/discussions', '/support', '/help', '/chat', '/slack', '/discord', '/telegram', '/reddit', '/stack-overflow'],
        pricing: ['/pricing', '/plans', '/cost', '/billing', '/subscriptions', '/enterprise', '/custom', '/quote', '/calculator', '/comparison', '/tiers'],
        enterprise: ['/enterprise', '/business', '/corporate', '/industries', '/solutions', '/consulting', '/professional-services', '/training', '/support'],
        partners: ['/partners', '/resellers', '/affiliates', '/marketplace', '/integrations', '/ecosystem', '/certified-partners', '/referral-program'],
        developers: ['/developers', '/dev', '/engineering', '/tech', '/architecture', '/infrastructure', '/deployment', '/ci-cd', '/testing', '/debugging'],
        support: ['/support', '/help', '/contact', '/tickets', '/chat', '/phone', '/email', '/status', '/outages', '/emergency'],
        resources: ['/resources', '/downloads', '/templates', '/assets', '/media', '/videos', '/webinars', '/events', '/training', '/certification'],
        integrations: ['/integrations', '/connectors', '/bridges', '/sync', '/automation', '/webhooks', '/api', '/sdk', '/libraries']
      },
      subcategoryPatterns: {
        downloads: {
          releases: ['/releases', '/versions', '/changelog', '/updates', '/whats-new'],
          beta: ['/beta', '/alpha', '/nightly', '/canary', '/preview', '/experimental'],
          platforms: ['/download/windows', '/download/mac', '/download/linux', '/download/ios', '/download/android']
        },
        community: {
          forum: ['/forum', '/discussions', '/questions', '/answers', '/topics'],
          chat: ['/chat', '/slack', '/discord', '/telegram', '/irc', '/gitter'],
          support: ['/support', '/help', '/troubleshooting', '/bug-reports', '/feature-requests']
        }
      },
      regionalPatterns: {
        'en-us': ['', '/us', '/en', '/en-us'],
        'en-gb': ['/uk', '/en-gb', '/gb'],
        'eu': ['/eu', '/europe', '/european'],
        'ca': ['/ca', '/canada', '/en-ca'],
        'au': ['/au', '/australia', '/en-au']
      }
    },
    'data-analytics': {
      name: 'Data & Analytics',
      companies: ['Tableau', 'Power BI', 'Looker', 'Mode', 'Amplitude', 'Mixpanel', 'Segment', 'Snowflake', 'Databricks', 'Fivetran', 'dbt', 'Airbyte', 'Meltano', 'Great Expectations', 'Monte Carlo', 'DataDog', 'New Relic', 'Splunk', 'Elastic', 'Grafana'],
      categories: ['marketing', 'docs', 'api', 'templates', 'resources', 'pricing', 'enterprise', 'partners', 'developers', 'support', 'resources', 'demos'],
      description: 'Data visualization and analytics platforms with comprehensive business intelligence solutions',
      linkPatterns: {
        marketing: ['', '/solutions', '/pricing', '/enterprise', '/industries', '/features', '/capabilities', '/use-cases', '/case-studies', '/testimonials', '/press', '/about'],
        docs: ['/docs', '/guides', '/tutorials', '/api', '/reference', '/examples', '/quickstart', '/getting-started', '/best-practices', '/troubleshooting', '/faq', '/help'],
        api: ['/api', '/docs/api', '/integrations', '/webhooks', '/sdk', '/libraries', '/tools', '/playground', '/console', '/endpoints', '/authentication', '/rate-limits'],
        templates: ['/templates', '/dashboards', '/examples', '/gallery', '/showcase', '/samples', '/workbooks', '/reports', '/visualizations', '/charts'],
        resources: ['/resources', '/blog', '/webinars', '/events', '/training', '/downloads', '/templates', '/assets', '/media', '/videos', '/certification'],
        pricing: ['/pricing', '/plans', '/cost', '/billing', '/subscriptions', '/enterprise', '/custom', '/quote', '/calculator', '/comparison', '/tiers'],
        enterprise: ['/enterprise', '/business', '/corporate', '/industries', '/solutions', '/consulting', '/professional-services', '/training', '/support'],
        partners: ['/partners', '/resellers', '/affiliates', '/marketplace', '/integrations', '/ecosystem', '/certified-partners', '/referral-program'],
        developers: ['/developers', '/dev', '/engineering', '/tech', '/architecture', '/infrastructure', '/deployment', '/ci-cd', '/testing', '/debugging'],
        support: ['/support', '/help', '/contact', '/tickets', '/chat', '/phone', '/email', '/status', '/outages', '/emergency'],
        demos: ['/demos', '/examples', '/showcase', '/gallery', '/samples', '/templates', '/dashboards', '/reports']
      },
      subcategoryPatterns: {
        templates: {
          dashboards: ['/dashboards', '/templates', '/examples', '/samples', '/gallery'],
          reports: ['/reports', '/templates', '/examples', '/samples', '/gallery'],
          visualizations: ['/visualizations', '/charts', '/graphs', '/maps', '/tables']
        },
        resources: {
          blog: ['/blog', '/insights', '/analytics', '/data-science', '/business-intelligence'],
          webinars: ['/webinars', '/events', '/seminars', '/workshops', '/training'],
          training: ['/training', '/courses', '/certification', '/academy', '/university']
        }
      },
      regionalPatterns: {
        'en-us': ['', '/us', '/en', '/en-us'],
        'en-gb': ['/uk', '/en-gb', '/gb'],
        'eu': ['/eu', '/europe', '/european'],
        'ca': ['/ca', '/canada', '/en-ca'],
        'au': ['/au', '/australia', '/en-au']
      }
    }
  };
  
  return enhancedGroupings;
};

const INDUSTRY_GROUPINGS = getIndustryGroupings();

interface CompetitorGroup {
  id: string;
  name: string;
  companies: string[];
  categories: string[];
  urls: Record<string, Record<string, string>>;
}

interface ScrapingTarget {
  company: string;
  category: string;
  url: string;
  enabled: boolean;
  priority?: 'high' | 'medium' | 'low';
}

// Enhanced Link Targeting Service for intelligent URL generation
class EnhancedLinkTargetingService {
  private patternSuccessRates: Map<string, number> = new Map();
  private companyPatterns: Map<string, Map<string, string[]>> = new Map();
  private industryPatterns: Map<string, Map<string, string[]>> = new Map();
  
  constructor() {
    this.initializePatterns();
  }
  
  private initializePatterns() {
    // Initialize with industry-specific patterns
    const industryGroupings = getIndustryGroupings();
    
    Object.entries(industryGroupings).forEach(([industry, config]) => {
      this.industryPatterns.set(industry, new Map(Object.entries(config.linkPatterns)));
      
      // Initialize company-specific patterns
      config.companies.forEach(company => {
        const companyPatterns = new Map(Object.entries(config.linkPatterns));
        this.companyPatterns.set(company.toLowerCase(), companyPatterns);
      });
    });
  }
  
  // Generate intelligent URLs based on company and category
  generateIntelligentUrls(company: string, categories: string[]): Record<string, string> {
    const urls: Record<string, string> = {};
    const companyLower = company.toLowerCase();
    
    categories.forEach(category => {
      // Try company-specific patterns first
      let patterns = this.companyPatterns.get(companyLower)?.get(category);
      
      if (!patterns) {
        // Fallback to industry patterns
        const industry = this.findIndustryForCompany(company);
        if (industry) {
          patterns = this.industryPatterns.get(industry)?.get(category);
        }
      }
      
      if (patterns && patterns.length > 0) {
        // Select best pattern based on success rate
        const bestPattern = this.selectBestPattern(company, category, patterns);
        const baseDomain = this.generateBaseDomain(company);
        urls[category] = `https://www.${baseDomain}${bestPattern}`;
        
        // Add subcategory and regional variations
        this.addSubcategoryUrls(urls, company, category, baseDomain);
        this.addRegionalUrls(urls, company, category, baseDomain);
        
        // Add alternative patterns for comprehensive coverage
        this.addAlternativePatterns(urls, company, category, patterns, baseDomain);
      } else {
        // Fallback to generic patterns
        const fallbackUrl = this.generateFallbackUrl(company, category);
        urls[category] = fallbackUrl;
      }
    });
    
    return urls;
  }
  
  private findIndustryForCompany(company: string): string | null {
    const industryGroupings = getIndustryGroupings();
    
    for (const [industry, config] of Object.entries(industryGroupings)) {
      if (config.companies.some(c => c.toLowerCase() === company.toLowerCase())) {
        return industry;
      }
    }
    
    return null;
  }
  
  private selectBestPattern(company: string, category: string, patterns: string[]): string {
    // Check if we have success rate data
    const patternKey = `${company}_${category}`;
    const successRates = this.patternSuccessRates.get(patternKey);
    
    if (successRates && patterns.length > 1) {
      // Sort by success rate and return the best
      const sortedPatterns = patterns.sort((a, b) => {
        const rateA = this.getPatternSuccessRate(company, category, a);
        const rateB = this.getPatternSuccessRate(company, category, b);
        return rateB - rateA;
      });
      return sortedPatterns[0];
    }
    
    // Default intelligent selection based on category
    if (category === 'marketing') {
      return patterns.find(p => p === '' || p === '/features') || patterns[0];
    } else if (category === 'docs') {
      return patterns.find(p => p === '/docs') || patterns[0];
    } else if (category === 'api') {
      return patterns.find(p => p === '/api') || patterns[0];
    } else if (category === 'pricing') {
      return patterns.find(p => p === '/pricing') || patterns[0];
    } else if (category === 'security') {
      return patterns.find(p => p === '/security') || patterns[0];
    }
    
    return patterns[0];
  }
  
  private addSubcategoryUrls(urls: Record<string, string>, company: string, category: string, baseDomain: string) {
    const industry = this.findIndustryForCompany(company);
    if (!industry) return;
    
    const industryGroupings = getIndustryGroupings();
    const config = industryGroupings[industry];
    
    if (config.subcategoryPatterns && config.subcategoryPatterns[category]) {
      Object.entries(config.subcategoryPatterns[category]).forEach(([subcategory, subPatterns]) => {
        if (Array.isArray(subPatterns) && subPatterns.length > 0) {
          urls[`${category}_${subcategory}`] = `https://www.${baseDomain}${subPatterns[0]}`;
        }
      });
    }
  }
  
  private addRegionalUrls(urls: Record<string, string>, company: string, category: string, baseDomain: string) {
    const industry = this.findIndustryForCompany(company);
    if (!industry) return;
    
    const industryGroupings = getIndustryGroupings();
    const config = industryGroupings[industry];
    
    if (config.regionalPatterns) {
      Object.entries(config.regionalPatterns).forEach(([region, regionPatterns]) => {
        if (Array.isArray(regionPatterns) && regionPatterns.length > 0) {
          urls[`${category}_${region}`] = `https://www.${baseDomain}${regionPatterns[0]}`;
        }
      });
    }
  }
  
  private addAlternativePatterns(urls: Record<string, string>, company: string, category: string, patterns: string[], baseDomain: string) {
    // Add up to 3 alternative patterns for comprehensive coverage
    const alternativePatterns = patterns.slice(1, 4);
    alternativePatterns.forEach((pattern, index) => {
      urls[`${category}_alt${index + 1}`] = `https://www.${baseDomain}${pattern}`;
    });
  }
  
  private generateFallbackUrl(company: string, category: string): string {
    const baseDomain = this.generateBaseDomain(company);
    
    // Enhanced fallback patterns
    const fallbackPatterns: Record<string, string[]> = {
      marketing: ['', '/features', '/about', '/solutions'],
      docs: ['/docs', '/help', '/guides', '/support'],
      api: ['/api', '/docs/api', '/developers', '/integrations'],
      blog: ['/blog', '/news', '/updates', '/insights'],
      community: ['/community', '/forum', '/support', '/help'],
      pricing: ['/pricing', '/plans', '/cost', '/billing'],
      security: ['/security', '/trust', '/compliance', '/privacy'],
      enterprise: ['/enterprise', '/business', '/corporate', '/solutions'],
      partners: ['/partners', '/resellers', '/marketplace', '/ecosystem'],
      developers: ['/developers', '/dev', '/engineering', '/tech'],
      support: ['/support', '/help', '/contact', '/tickets'],
      resources: ['/resources', '/downloads', '/templates', '/assets']
    };
    
    const patterns = fallbackPatterns[category] || [`/${category}`];
    return `https://www.${baseDomain}${patterns[0]}`;
  }
  
  private generateBaseDomain(company: string): string {
    return `${company.toLowerCase().replace(/\s+/g, '')}.com`;
  }
  
  private getPatternSuccessRate(company: string, category: string, pattern: string): number {
    const key = `${company}_${category}_${pattern}`;
    return this.patternSuccessRates.get(key) || 0.5; // Default to 50% if unknown
  }
  
  // Update success rates based on scraping results
  updatePatternSuccessRate(company: string, category: string, pattern: string, success: boolean) {
    const key = `${company}_${category}_${pattern}`;
    const currentRate = this.patternSuccessRates.get(key) || 0.5;
    
    // Simple moving average for success rate
    const newRate = success ? 
      Math.min(currentRate + 0.1, 1.0) : 
      Math.max(currentRate - 0.1, 0.0);
    
    this.patternSuccessRates.set(key, newRate);
  }
  
  // Get success rate statistics
  getSuccessRateStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.patternSuccessRates.forEach((rate, key) => {
      stats[key] = rate;
    });
    return stats;
  }
  
  // Learn from successful patterns
  learnFromSuccess(company: string, category: string, successfulUrls: string[]) {
    successfulUrls.forEach(url => {
      const pattern = this.extractPatternFromUrl(url);
      if (pattern) {
        this.updatePatternSuccessRate(company, category, pattern, true);
      }
    });
  }
  
  private extractPatternFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      return path === '/' ? '' : path;
    } catch {
      return null;
    }
  }
}

// Initialize enhanced link targeting service
const enhancedLinkTargetingService = new EnhancedLinkTargetingService();

export default function ScrapeDashboard() {
  const { toast } = useToast();
  const { state, addItems, clear } = useScrapeStore();
  const items = state.items;

  // Core state
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(25);
  const [openaiKey, setOpenaiKey] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  // Scraping configuration
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customCompanies, setCustomCompanies] = useState<string[]>(['']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['marketing', 'docs']);
  const [companyUrls, setCompanyUrls] = useState<Record<string, Record<string, string>>>({});
  
  // UI state
  const [activeTab, setActiveTab] = useState('scraping');
  const [selectedChart, setSelectedChart] = useState('overview');
  const [filters, setFilters] = useState({
    search: '',
    company: '',
    category: '',
    dateRange: 'all'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // AI Analysis state
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [analysisTone, setAnalysisTone] = useState<'neutral' | 'confident' | 'skeptical' | 'enthusiastic'>('neutral');
  const [focusAreas, setFocusAreas] = useState('positioning, differentiation, pricing, risks, opportunities');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<Map<string, AIAnalysisResult>>(new Map());
  const [competitiveSummary, setCompetitiveSummary] = useState<string>('');

  // Database state
  const [dbItems, setDbItems] = useState<DatabaseItem[]>([]);
  const [dbStats, setDbStats] = useState<{
    totalItems?: number;
    companies?: string[];
    contentQuality?: {
      totalWords: number;
      totalCharacters: number;
      richContent: number;
      hasLinks: number;
      hasImages: number;
      hasCode: number;
      structuredContent: number;
      averageWordsPerItem: number;
      averageCharsPerItem: number;
    };
  } | null>(null);

  // Enhanced scraping setup state
  const [selectedTargets, setSelectedTargets] = useState<Map<string, Set<string>>>(new Map());
  const [useBackendKey, setUseBackendKey] = useState(true);
  const [frontendOpenAIKey, setFrontendOpenAIKey] = useState<string>('');
  const [showTargetSelection, setShowTargetSelection] = useState(false);

  // Enhanced analytics using database data
  const metrics = useMemo(() => {
    if (!dbStats) return {
      byCat: [],
      byCompany: [],
      trendData: [],
      contentQuality: {
        totalWords: 0,
        totalCharacters: 0,
        richContent: 0,
        hasLinks: 0,
        hasImages: 0,
        hasCode: 0,
        structuredContent: 0,
        averageWordsPerItem: 0,
        averageCharsPerItem: 0
      },
      totalItems: 0,
      uniqueCompanies: 0
    };

    const byCat: Record<string, number> = {};
    const byCompany: Record<string, number> = {};
    const timeData: Record<string, number> = {};
    
    dbItems.forEach(item => {
      byCat[item.category] = (byCat[item.category] || 0) + 1;
      byCompany[item.company] = (byCompany[item.company] || 0) + 1;
      
      const date = new Date(item.scrapedAt).toLocaleDateString();
      timeData[date] = (timeData[date] || 0) + 1;
    });
    
    const trendData = Object.entries(timeData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count }));
    
    // Calculate content quality metrics
    const totalWords = dbItems.reduce((acc, item) => acc + (item.markdown?.split(/\s+/).length || 0), 0);
    const totalCharacters = dbItems.reduce((acc, item) => acc + (item.markdown?.length || 0), 0);
    
    return {
      byCat: Object.entries(byCat).map(([name, value]) => ({ name, value })),
      byCompany: Object.entries(byCompany).map(([name, value]) => ({ name, value })),
      trendData,
      contentQuality: {
        totalWords: dbStats.contentQuality?.totalWords || 0,
        totalCharacters: dbStats.contentQuality?.totalCharacters || 0,
        richContent: dbStats.contentQuality?.richContent || 0,
        hasLinks: dbStats.contentQuality?.hasLinks || 0,
        hasImages: dbStats.contentQuality?.hasImages || 0,
        hasCode: dbStats.contentQuality?.hasCode || 0,
        structuredContent: dbStats.contentQuality?.structuredContent || 0,
        averageWordsPerItem: dbStats.contentQuality?.averageWordsPerItem || 0,
        averageCharsPerItem: dbStats.contentQuality?.averageCharsPerItem || 0
      },
      totalItems: dbStats.totalItems || dbItems.length,
      uniqueCompanies: dbStats.companies?.length || Object.keys(byCompany).length
    };
  }, [dbItems, dbStats]);

  const filteredItems = useMemo(() => {
    if (!dbItems || !Array.isArray(dbItems)) {
      return [];
    }
    
    return dbItems.filter(item => {
      if (!item || typeof item !== 'object') return false;
      
      const matchesSearch = !filters.search || 
        (item.title && item.title.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.markdown && item.markdown.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.company && item.company.toLowerCase().includes(filters.search.toLowerCase())) ||
        (item.ai_analysis && item.ai_analysis.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesCompany = !filters.company || (item.company && item.company === filters.company);
      const matchesCategory = !filters.category || (item.category && item.category === filters.category);
      
      let matchesDate = true;
      if (filters.dateRange !== 'all' && item.scrapedAt) {
        try {
          const itemDate = new Date(item.scrapedAt);
          if (isNaN(itemDate.getTime())) return false;
          
          const now = new Date();
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
          
          switch (filters.dateRange) {
            case 'today': matchesDate = diffDays <= 1; break;
            case 'week': matchesDate = diffDays <= 7; break;
            case 'month': matchesDate = diffDays <= 30; break;
          }
        } catch (error) {
          console.warn('Date parsing error:', error);
          matchesDate = false;
        }
      }
      
      return matchesSearch && matchesCompany && matchesCategory && matchesDate;
    });
  }, [dbItems, filters]);

  useEffect(() => {
    checkBackendConnection();
    initializeDatabase();
    loadStoredApiKey();
  }, []);

  const initializeDatabase = useCallback(async () => {
    try {
      await databaseService.init();
      await loadDatabaseItems();
      await loadDatabaseStats();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }, []);

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  const loadStoredApiKey = () => {
    const stored = localStorage.getItem('openai_api_key');
    if (stored) {
      setOpenaiKey(stored);
      aiService.setApiKey(stored);
    }
  };

  const loadDatabaseItems = async () => {
    try {
      const items = await databaseService.getAllItems();
      setDbItems(items);
    } catch (error) {
      console.error('Failed to load database items:', error);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const stats = await databaseService.getStats();
      // Calculate additional content quality metrics
      const allItems = await databaseService.getAllItems();
      const contentQuality = {
        totalWords: allItems.reduce((acc, item) => acc + (item.markdown?.split(/\s+/).length || 0), 0),
        totalCharacters: allItems.reduce((acc, item) => acc + (item.markdown?.length || 0), 0),
        richContent: stats.contentQuality?.richContent || 0,
        hasLinks: stats.contentQuality?.hasLinks || 0,
        hasImages: stats.contentQuality?.hasImages || 0,
        hasCode: stats.contentQuality?.hasCode || 0,
        structuredContent: stats.contentQuality?.structuredContent || 0,
        averageWordsPerItem: allItems.length > 0 ? Math.round(allItems.reduce((acc, item) => acc + (item.markdown?.split(/\s+/).length || 0), 0) / allItems.length) : 0,
        averageCharsPerItem: allItems.length > 0 ? Math.round(allItems.reduce((acc, item) => acc + (item.markdown?.length || 0), 0) / allItems.length) : 0
      };
      
      setDbStats({
        ...stats,
        contentQuality
      });
    } catch (error) {
      console.error('Failed to load database stats:', error);
    }
  };

  const checkBackendConnection = async () => {
    try {
      setBackendStatus('checking');
      const health = await APIService.healthCheck();
      if (health.status === 'healthy') {
        setBackendStatus('connected');
      } else {
        setBackendStatus('disconnected');
      }
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  const onSaveKey = () => {
    if (!openaiKey) return;
    aiService.setApiKey(openaiKey);
    toast({ title: 'OpenAI API key saved' });
  };

  const analyzeScrapedContent = async (items: ScrapedItem[]) => {
    // FIXED: Improved API key validation logic
    const hasValidApiKey = useBackendKey ? openaiKey : frontendOpenAIKey;
    if (!hasValidApiKey) {
      toast({ title: 'OpenAI API key required', description: 'Please set your OpenAI API key to enable AI analysis', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const focusAreasArray = focusAreas.split(',').map(area => area.trim());
      const analysisResults = await aiService.analyzeBatch(items, focusAreasArray);
      
      // Update database with AI analysis
      for (const [itemId, analysis] of analysisResults) {
        await databaseService.updateItemAI(itemId, analysis);
      }
      
      setAiInsights(analysisResults);
      await loadDatabaseItems(); // Refresh data
      await loadDatabaseStats();
      
      toast({ title: 'AI analysis complete', description: `${analysisResults.size} items analyzed` });
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast({ title: 'AI analysis failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateCompetitiveSummary = async () => {
    // FIXED: Improved API key validation logic
    const hasValidApiKey = useBackendKey ? openaiKey : frontendOpenAIKey;
    if (!hasValidApiKey) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    try {
      const companies = Array.from(new Set(dbItems.map(item => item.company)));
      const focusAreasArray = focusAreas.split(',').map(area => area.trim());
      
      const summary = await aiService.generateCompetitiveSummary(companies, focusAreasArray);
      setCompetitiveSummary(summary);
      
      toast({ title: 'Competitive summary generated' });
    } catch (error) {
      console.error('Failed to generate competitive summary:', error);
      toast({ title: 'Summary generation failed', variant: 'destructive' });
    }
  };

  const loadPresetGroup = (presetKey: string) => {
    const preset = INDUSTRY_GROUPINGS[presetKey as keyof typeof INDUSTRY_GROUPINGS];
    if (!preset) return;
    
    setCustomCompanies(preset.companies);
    setSelectedCategories(preset.categories);
    
    // Generate URLs using enhanced patterns
    const newCompanyUrls: Record<string, Record<string, string>> = {};
    preset.companies.forEach(company => {
      const baseDomain = `${company.toLowerCase().replace(/\s+/g, '')}.com`;
      newCompanyUrls[company] = {};
      
      preset.categories.forEach(category => {
        if (preset.linkPatterns[category]) {
          const patterns = preset.linkPatterns[category];
          // Generate multiple URLs for each category using different patterns
          newCompanyUrls[company][category] = `https://www.${baseDomain}${patterns[0]}`;
        } else {
          newCompanyUrls[company][category] = `https://www.${baseDomain}/${category}`;
        }
      });
    });
    
    setCompanyUrls(newCompanyUrls);
    setSelectedPreset(presetKey);

    // Automatically select all targets for all companies - FIXED: removed setTimeout
    const newMap = new Map();
    preset.companies.forEach(company => {
      newMap.set(company, new Set(preset.categories));
    });
    setSelectedTargets(newMap);
    setShowTargetSelection(true);
    
    toast({ 
      title: `Loaded ${preset.name} preset`, 
      description: `Configured ${preset.companies.length} companies with ${preset.categories.length} categories. All targets selected automatically.` 
    });
  };

  const addCustomCompany = () => {
    setCustomCompanies(prev => [...prev, '']);
  };

  const addCompanyWithUrls = (companyName: string) => {
    if (!companyName.trim()) return;
    
    // Add company to list
    setCustomCompanies(prev => [...prev, companyName.trim()]);
    
    // Use enhanced link targeting service for intelligent URL generation
    const newUrls = enhancedLinkTargetingService.generateIntelligentUrls(companyName.trim(), selectedCategories);
    
    setCompanyUrls(prev => ({
      ...prev,
      [companyName.trim()]: newUrls
    }));

    // Automatically select all targets for the new company - FIXED: removed setTimeout
    const allCategories = new Set(selectedCategories);
    setSelectedTargets(prev => {
      const newMap = new Map(prev);
      newMap.set(companyName.trim(), allCategories);
      return newMap;
    });
    setShowTargetSelection(true);
    
    // Show comprehensive success message with enhanced targeting info
    const totalUrls = Object.keys(newUrls).length;
    const primaryUrls = selectedCategories.length;
    const enhancedUrls = totalUrls - primaryUrls;
    
    toast({ 
      title: `Added ${companyName} with Enhanced Targeting`, 
      description: `Generated ${totalUrls} URLs (${primaryUrls} primary + ${enhancedUrls} enhanced patterns) including subcategories, regional variants, and alternative patterns for comprehensive coverage.` 
    });
  };

  // Enhanced helper functions for improved scraping setup
  const toggleTargetSelection = (company: string, category: string) => {
    setSelectedTargets(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(company)) {
        newMap.set(company, new Set());
      }
      const companyTargets = new Set(newMap.get(company)!);
      
      if (companyTargets.has(category)) {
        companyTargets.delete(category);
      } else {
        companyTargets.add(category);
      }
      
      newMap.set(company, companyTargets);
      return newMap;
    });
  };

  const isTargetSelected = (company: string, category: string) => {
    return selectedTargets.get(company)?.has(category) || false;
  };

  const getSelectedTargetsCount = () => {
    let count = 0;
    selectedTargets.forEach(targets => {
      count += targets.size;
    });
    return count;
  };

  const selectAllTargetsForCompany = (company: string) => {
    const targets = linkTargetingService.generateLinkTargets(company, selectedCategories);
    const allCategories = new Set(targets.map(t => t.category));
    setSelectedTargets(prev => {
      const newMap = new Map(prev);
      newMap.set(company, allCategories);
      return newMap;
    });
  };

  const clearAllTargetsForCompany = (company: string) => {
    setSelectedTargets(prev => {
      const newMap = new Map(prev);
      newMap.set(company, new Set());
      return newMap;
    });
  };

  const selectAllTargets = () => {
    const newMap = new Map();
    customCompanies.filter(c => c.trim()).forEach(company => {
      const targets = linkTargetingService.generateLinkTargets(company, selectedCategories);
      const allCategories = new Set(targets.map(t => t.category));
      newMap.set(company, allCategories);
    });
    setSelectedTargets(newMap);
  };

  const clearAllTargets = () => {
    setSelectedTargets(new Map());
  };

  // Helper function to check if we have a valid API key
  const hasValidApiKey = () => {
    return useBackendKey ? !!openaiKey : !!frontendOpenAIKey;
  };

  // Enhanced AI Analysis Functions
  const runContentIntelligenceAnalysis = async () => {
    if (!hasValidApiKey()) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const focusAreasArray = ['content themes', 'key topics', 'main messages', 'content quality'];
      const analysisResults = await aiService.analyzeBatch(dbItems, focusAreasArray);
      
      // Update database with AI analysis
      for (const [itemId, analysis] of analysisResults) {
        await databaseService.updateItemAI(itemId, analysis);
      }
      
      setAiInsights(analysisResults);
      await loadDatabaseItems();
      await loadDatabaseStats();
      
      toast({ title: 'Content intelligence analysis complete', description: `${analysisResults.size} items analyzed` });
    } catch (error) {
      console.error('Content intelligence analysis failed:', error);
      toast({ title: 'Analysis failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runTrendDetectionAnalysis = async () => {
    if (!hasValidApiKey()) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const focusAreasArray = ['emerging trends', 'market patterns', 'industry shifts', 'future predictions'];
      const analysisResults = await aiService.analyzeBatch(dbItems, focusAreasArray);
      
      // Update database with AI analysis
      for (const [itemId, analysis] of analysisResults) {
        await databaseService.updateItemAI(itemId, analysis);
      }
      
      setAiInsights(analysisResults);
      await loadDatabaseItems();
      await loadDatabaseStats();
      
      toast({ title: 'Trend detection analysis complete', description: `${analysisResults.size} items analyzed` });
    } catch (error) {
      console.error('Trend detection analysis failed:', error);
      toast({ title: 'Analysis failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runCompetitivePositioningAnalysis = async () => {
    if (!hasValidApiKey()) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const focusAreasArray = ['competitive positioning', 'market differentiation', 'brand strategy', 'competitive advantages'];
      const analysisResults = await aiService.analyzeBatch(dbItems, focusAreasArray);
      
      // Update database with AI analysis
      for (const [itemId, analysis] of analysisResults) {
        await databaseService.updateItemAI(itemId, analysis);
      }
      
      setAiInsights(analysisResults);
      await loadDatabaseItems();
      await loadDatabaseStats();
      
      toast({ title: 'Competitive positioning analysis complete', description: `${analysisResults.size} items analyzed` });
    } catch (error) {
      console.error('Competitive positioning analysis failed:', error);
      toast({ title: 'Analysis failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runRiskAssessmentAnalysis = async () => {
    if (!hasValidApiKey()) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const focusAreasArray = ['risk factors', 'potential threats', 'market risks', 'business vulnerabilities'];
      const analysisResults = await aiService.analyzeBatch(dbItems, focusAreasArray);
      
      // Update database with AI analysis
      for (const [itemId, analysis] of analysisResults) {
        await databaseService.updateItemAI(itemId, analysis);
      }
      
      setAiInsights(analysisResults);
      await loadDatabaseItems();
      await loadDatabaseStats();
      
      toast({ title: 'Risk assessment analysis complete', description: `${analysisResults.size} items analyzed` });
    } catch (error) {
      console.error('Risk assessment analysis failed:', error);
      toast({ title: 'Analysis failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runOpportunityAnalysis = async () => {
    if (!hasValidApiKey()) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const focusAreasArray = ['market opportunities', 'growth potential', 'strategic advantages', 'business opportunities'];
      const analysisResults = await aiService.analyzeBatch(dbItems, focusAreasArray);
      
      // Update database with AI analysis
      for (const [itemId, analysis] of analysisResults) {
        await databaseService.updateItemAI(itemId, analysis);
      }
      
      setAiInsights(analysisResults);
      await loadDatabaseItems();
      await loadDatabaseStats();
      
      toast({ title: 'Opportunity analysis complete', description: `${analysisResults.size} items analyzed` });
    } catch (error) {
      console.error('Opportunity analysis failed:', error);
      toast({ title: 'Analysis failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runMarketSentimentAnalysis = async () => {
    if (!hasValidApiKey()) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const focusAreasArray = ['market sentiment', 'public perception', 'brand sentiment', 'emotional tone'];
      const analysisResults = await aiService.analyzeBatch(dbItems, focusAreasArray);
      
      // Update database with AI analysis
      for (const [itemId, analysis] of analysisResults) {
        await databaseService.updateItemAI(itemId, analysis);
      }
      
      setAiInsights(analysisResults);
      await loadDatabaseItems();
      await loadDatabaseStats();
      
      toast({ title: 'Market sentiment analysis complete', description: `${analysisResults.size} items analyzed` });
    } catch (error) {
      console.error('Market sentiment analysis failed:', error);
      toast({ title: 'Analysis failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runComprehensiveAnalysis = async () => {
    if (!hasValidApiKey()) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const focusAreasArray = [
        'content intelligence', 'trend detection', 'competitive positioning', 
        'risk assessment', 'opportunity analysis', 'market sentiment'
      ];
      const analysisResults = await aiService.analyzeBatch(dbItems, focusAreasArray);
      
      // Update database with AI analysis
      for (const [itemId, analysis] of analysisResults) {
        await databaseService.updateItemAI(itemId, analysis);
      }
      
      setAiInsights(analysisResults);
      await loadDatabaseItems();
      await loadDatabaseStats();
      
      toast({ title: 'Comprehensive analysis complete', description: `${analysisResults.size} items analyzed` });
    } catch (error) {
      console.error('Comprehensive analysis failed:', error);
      toast({ title: 'Analysis failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateStrategicRecommendations = async () => {
    if (!hasValidApiKey()) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    try {
      const companies = Array.from(new Set(dbItems.map(item => item.company)));
      const focusAreasArray = ['strategic recommendations', 'action items', 'business opportunities', 'risk mitigation'];
      
      const recommendations = await aiService.generateCompetitiveSummary(companies, focusAreasArray);
      setCompetitiveSummary(recommendations);
      
      toast({ title: 'Strategic recommendations generated' });
    } catch (error) {
      console.error('Failed to generate strategic recommendations:', error);
      toast({ title: 'Recommendations generation failed', variant: 'destructive' });
    }
  };

  const generateAllTargets = () => {
    const allTargets: Record<string, LinkTarget[]> = {};
    
    customCompanies.filter(c => c.trim()).forEach(company => {
      const targets = linkTargetingService.generateLinkTargets(company, selectedCategories);
      allTargets[company] = targets;
    });
    
    return allTargets;
  };

  const updateTargetUrl = (company: string, category: string, url: string) => {
    setCompanyUrls(prev => ({
      ...prev,
      [company]: {
        ...prev[company],
        [category]: url
      }
    }));
  };

  const getFinalScrapingTargets = (): ScrapingTarget[] => {
    const targets: ScrapingTarget[] = [];
    
    selectedTargets.forEach((categories, company) => {
      categories.forEach(category => {
        const url = companyUrls[company]?.[category] || '';
        if (url.trim()) {
          targets.push({
            company,
            category,
            url: url.trim(),
            enabled: true
          });
        }
      });
    });
    
    return targets;
  };

  const runAIAnalysis = async () => {
    // FIXED: Improved API key validation logic
    const hasValidApiKey = useBackendKey ? openaiKey : frontendOpenAIKey;
    if (!hasValidApiKey) {
      toast({ title: 'OpenAI API key required', variant: 'destructive' });
      return;
    }

    // Set the appropriate API key
    if (!useBackendKey) {
      aiService.setApiKey(frontendOpenAIKey);
    }

    setIsAnalyzing(true);
    try {
      const focusAreasArray = focusAreas.split(',').map(area => area.trim());
      const analysisResults = await aiService.analyzeBatch(dbItems, focusAreasArray);
      
      // Update database with AI analysis
      for (const [itemId, analysis] of analysisResults) {
        await databaseService.updateItemAI(itemId, analysis);
      }
      
      setAiInsights(analysisResults);
      await loadDatabaseItems();
      await loadDatabaseStats();
      
      toast({ title: 'AI analysis complete', description: `${analysisResults.size} items analyzed` });
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast({ title: 'AI analysis failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeCustomCompany = (index: number) => {
    setCustomCompanies(prev => prev.filter((_, i) => i !== index));
  };

  const updateCompanyName = (index: number, name: string) => {
    const updated = [...customCompanies];
    updated[index] = name;
    setCustomCompanies(updated);
  };

  const updateCompanyUrl = (company: string, category: string, url: string) => {
    setCompanyUrls(prev => ({
      ...prev,
      [company]: {
        ...prev[company],
        [category]: url
      }
    }));
  };

  const getScrapingTargets = (): ScrapingTarget[] => {
    const targets: ScrapingTarget[] = [];
    
    customCompanies.forEach(company => {
      if (!company.trim()) return;
      
      selectedCategories.forEach(category => {
        // First try to get URLs from companyUrls (user-configured)
        let url = companyUrls[company]?.[category] || '';
        
        // If no user URL, generate from LinkTargetingService
        if (!url.trim()) {
          const linkTargets = linkTargetingService.generateLinkTargets(company, [category]);
          const highPriorityTarget = linkTargets.find(target => target.priority === 'high');
          if (highPriorityTarget) {
            url = highPriorityTarget.url;
          }
        }
        
        if (url.trim()) {
          targets.push({
            company: company.trim(),
            category,
            url: url.trim(),
            enabled: true
          });
        }
      });
    });
    
    return targets;
  };

  const runScraping = async (targets: ScrapingTarget[]) => {
    setIsLoading(true);
    let totalScraped = 0;
    const scrapedItems: ScrapedItem[] = [];
    
    try {
      // Enhanced scraping with comprehensive metadata capture
      for (const target of targets) {
        if (!target.enabled) continue;
        
        try {
          // Enhanced scraping request with comprehensive parameters
          const enhancedRequest = {
            company: target.company,
            urls: { [target.category]: target.url },
            categories: [target.category],
            page_limit: limit,
            // Enhanced metadata capture parameters
            depth_limit: 3, // Crawl depth for comprehensive coverage
            respect_robots: true, // Ethical scraping
            user_agent: 'InsightForge-WebIntelligence/1.0 (+https://insightforge.ai/bot)',
            delay_between_requests: 1000, // 1 second delay between requests
            // Content extraction preferences
            extract_metadata: true, // Extract title, description, author, date
            extract_links: true, // Extract internal and external links
            extract_images: true, // Extract image alt text and captions
            extract_tables: true, // Extract table data
            extract_forms: true, // Extract form field information
            // Content validation parameters
            min_content_length: 100, // Minimum content length in characters
            max_content_length: 50000, // Maximum content length in characters
            content_language: 'auto', // Auto-detect content language
            filter_duplicates: true, // Filter duplicate content
            // Quality assessment parameters
            readability_score: true, // Calculate readability metrics
            content_density: true, // Calculate information density
            freshness_indicator: true, // Detect content freshness
            authority_signals: true, // Identify authority indicators
            // Advanced targeting parameters
            follow_redirects: true, // Follow HTTP redirects
            handle_javascript: true, // Handle JavaScript-rendered content
            extract_dynamic_content: true, // Extract AJAX-loaded content
            capture_screenshots: false, // Disable screenshot capture for performance
            // Regional and localization parameters
            preferred_language: 'en', // Preferred language for content
            regional_variants: true, // Include regional content variants
            currency_format: 'auto', // Auto-detect currency format
            date_format: 'auto', // Auto-detect date format
            // Compliance and ethical parameters
            gdpr_compliance: true, // Respect GDPR requirements
            cookie_handling: 'minimal', // Minimal cookie usage
            session_persistence: false, // Don't persist sessions
            rate_limiting: 'adaptive' // Adaptive rate limiting
          };
          
          const response = await APIService.scrapeCompany(enhancedRequest);
          
          // Enhanced response processing with comprehensive metadata
          if (response.categories && response.categories[target.category]) {
            const categoryData = response.categories[target.category];
            if (categoryData.items) {
              // Transform to enhanced structured format
              const newItems: ScrapedItem[] = categoryData.items.map(item => ({
                id: item.id || genId(),
                company: target.company,
                category: target.category,
                url: item.url || target.url,
                title: item.title || `Scraped ${target.category} content`,
                markdown: item.content || item.markdown || '',
                html: item.content_html || '',
                scrapedAt: item.scraped_at || new Date().toISOString(),
                source: new URL(target.url).host,
                // Enhanced metadata fields
                metadata: {
                  // Content analysis
                  word_count: item.word_count || (item.content ? item.content.split(/\s+/).length : 0),
                  char_count: item.char_count || (item.content ? item.content.length : 0),
                  language: item.language || 'en',
                  readability_score: item.readability_score || null,
                  content_density: item.content_density || null,
                  freshness_score: item.freshness_score || null,
                  authority_score: item.authority_score || null,
                  // Technical metadata
                  http_status: item.http_status || 200,
                  response_time: item.response_time || null,
                  content_type: item.content_type || 'text/html',
                  encoding: item.encoding || 'utf-8',
                  // Content structure
                  has_images: item.has_images || false,
                  has_tables: item.has_tables || false,
                  has_forms: item.has_forms || false,
                  has_videos: item.has_videos || false,
                  // Link analysis
                  internal_links: item.internal_links || [],
                  external_links: item.external_links || [],
                  link_count: item.link_count || 0,
                  // SEO metadata
                  meta_title: item.meta_title || null,
                  meta_description: item.meta_description || null,
                  meta_keywords: item.meta_keywords || null,
                  canonical_url: item.canonical_url || null,
                  // Social media metadata
                  og_title: item.og_title || null,
                  og_description: item.og_description || null,
                  og_image: item.og_image || null,
                  twitter_card: item.twitter_card || null,
                  // Publication metadata
                  author: item.author || null,
                  published_date: item.published_date || null,
                  modified_date: item.modified_date || null,
                  // Business metadata
                  pricing_info: item.pricing_info || null,
                  contact_info: item.contact_info || null,
                  location_info: item.location_info || null,
                  // Content quality indicators
                  is_duplicate: item.is_duplicate || false,
                  quality_score: item.quality_score || null,
                  relevance_score: item.relevance_score || null,
                  // Scraping metadata
                  crawl_depth: item.crawl_depth || 1,
                  parent_url: item.parent_url || null,
                  redirect_chain: item.redirect_chain || [],
                  // Regional and localization
                  region: item.region || null,
                  currency: item.currency || null,
                  timezone: item.timezone || null,
                  // Compliance metadata
                  robots_txt_respected: item.robots_txt_respected || true,
                  gdpr_compliant: item.gdpr_compliant || true,
                  rate_limit_respected: item.rate_limit_respected || true
                },
                // Enhanced content fields
                content_summary: item.content_summary || null,
                key_phrases: item.key_phrases || [],
                sentiment_preview: item.sentiment_preview || null,
                topic_tags: item.topic_tags || [],
                // Link targeting metadata
                target_pattern: target.url,
                target_category: target.category,
                target_company: target.company,
                target_priority: target.priority || 'medium',
                // Performance metrics
                processing_time: item.processing_time || null,
                content_size: item.content_size || null,
                compression_ratio: item.compression_ratio || null,
                // AI analysis fields (existing)
                sentiment_score: item.sentiment_score || 0,
                ai_analysis: item.ai_analysis || '',
                key_topics: item.key_topics || [],
                risk_factors: item.risk_factors || [],
                competitive_insights: item.competitive_insights || '',
                updated_at: item.updated_at || new Date().toISOString()
              }));
              
              scrapedItems.push(...newItems);
              totalScraped += newItems.length;
            }
          }
        } catch (error) {
          console.error(`Failed to scrape ${target.category} for ${target.company}:`, error);
          
          // Log detailed error information for debugging
          const errorDetails = {
            target: target,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            url: target.url
          };
          
          console.error('Detailed scraping error:', errorDetails);
          
          // Continue with other targets instead of failing completely
          continue;
        }
      }
      
      // Enhanced storage with comprehensive data validation
      if (scrapedItems.length > 0) {
        // Validate and clean data before storage
        const validatedItems = scrapedItems.filter(item => {
          // Basic validation
          if (!item.url || !item.company || !item.category) return false;
          if (!item.markdown || item.markdown.length < 50) return false; // Minimum content length
          if (!item.title || item.title.length < 5) return false; // Minimum title length
          
          // Content quality validation
          if (item.metadata) {
            if (item.metadata.word_count && item.metadata.word_count < 10) return false; // Minimum word count
            if (item.metadata.content_density && item.metadata.content_density < 0.1) return false; // Minimum content density
          }
          
          return true;
        });
        
        if (validatedItems.length > 0) {
          await databaseService.addItems(validatedItems);
          await loadDatabaseItems();
          await loadDatabaseStats();
          
          // Add to store for immediate display
          addItems(validatedItems);
          
          // Show comprehensive success message
          toast({ 
            title: `Scraping completed successfully`, 
            description: `Scraped ${validatedItems.length} high-quality items from ${targets.length} targets. ${scrapedItems.length - validatedItems.length} items were filtered for quality.` 
          });
          
          // Optional: Run AI analysis automatically
          if (autoAnalysis && hasValidApiKey()) {
            setTimeout(() => analyzeScrapedContent(validatedItems), 1000);
          }
        } else {
          toast({ 
            title: 'No valid content found', 
            description: 'All scraped content failed quality validation. Please check your target URLs and try again.',
            variant: 'destructive'
          });
        }
      } else {
        toast({ 
          title: 'No content scraped', 
          description: 'No content was successfully scraped from the selected targets. Please check your configuration and try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Scraping failed:', error);
      toast({ 
        title: 'Scraping failed', 
        description: 'An unexpected error occurred during scraping. Please check the console for details.',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const csv = await databaseService.exportToCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'competitive_intelligence_data.csv';
      a.click();
      URL.revokeObjectURL(a.href);
      toast({ title: 'Data exported successfully' });
    } catch (error) {
      console.error('Export failed:', error);
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const onUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) return;
    
    try {
      if (ext === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (r) => {
            const mapped: ScrapedItem[] = r.data.filter(Boolean).map((row: { company?: string; category?: string; url: string; title: string; markdown?: string }) => ({
              id: genId(), 
              company: row.company || 'upload', 
              category: row.category || 'upload', 
              url: row.url, 
              title: row.title, 
              markdown: row.markdown || JSON.stringify(row, null, 2), 
              scrapedAt: new Date().toISOString(), 
              source: (() => { try { return new URL(row.url).host; } catch { return undefined; } })()
            }));
            addItems(mapped);
            toast({ title: `Imported ${mapped.length} rows from CSV` });
          },
        });
      } else if (ext === 'md' || ext === 'markdown') {
        const text = await file.text();
        addItems([{ 
          id: genId(), 
          company: 'upload', 
          category: 'upload', 
          title: file.name, 
          markdown: text, 
          scrapedAt: new Date().toISOString() 
        }]);
        toast({ title: 'Markdown imported' });
      } else if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await (mammoth as { extractRawText: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> }).extractRawText({ arrayBuffer });
        addItems([{ 
          id: genId(), 
          company: 'upload', 
          category: 'upload', 
          title: file.name, 
          markdown: result.value, 
          scrapedAt: new Date().toISOString() 
        }]);
        toast({ title: 'DOCX imported' });
      } else {
        toast({ title: 'Unsupported file type', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'File import failed', variant: 'destructive' });
    }
  };

  const clearAllData = async () => {
    try {
      await databaseService.clearAll();
      clear();
      setDbItems([]);
      setDbStats(null);
      setAiInsights(new Map());
      setCompetitiveSummary('');
      toast({ title: 'All data cleared' });
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast({ title: 'Failed to clear data', variant: 'destructive' });
    }
  };

  return (
    <main className="container mx-auto py-6 px-4">
      <SEO title="Scrape Intelligence | InsightForge" description="Targeted and aggregate web scraping across marketing, docs, RSS and social sources." canonical={window.location.href} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scrape Intelligence Dashboard</h1>
        <p className="text-muted-foreground">Monitor competitors and gather market intelligence through targeted web scraping</p>
      </div>

      {/* Backend Status */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {backendStatus === 'connected' && <Wifi className="h-5 w-5 text-green-500" />}
              {backendStatus === 'disconnected' && <WifiOff className="h-5 w-5 text-red-500" />}
              {backendStatus === 'checking' && <Wifi className="h-5 w-5 text-yellow-500 animate-spin" />}
              <span className="font-medium">
                {backendStatus === 'connected' ? 'Backend Connected' : 
                 backendStatus === 'disconnected' ? 'Backend Disconnected' : 'Checking Backend...'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkBackendConnection}
              disabled={backendStatus === 'checking'}
            >
              <Server className="h-4 w-4 mr-2" />
              {backendStatus === 'checking' ? 'Checking...' : 'Test Connection'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scraping">Scraping Setup</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="data">Data View</TabsTrigger>
        </TabsList>

        {/* Scraping Setup Tab */}
        <TabsContent value="scraping" className="space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Limit</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={250} 
                    value={limit} 
                    onChange={e => setLimit(parseInt(e.target.value || '25'))} 
                  />
                  <p className="text-xs text-muted-foreground">Maximum pages to scrape per target</p>
                </div>
                <div className="space-y-2">
                  <Label>Content Categories</Label>
                  <Select 
                    value={selectedCategories.join(',')} 
                    onValueChange={(value) => setSelectedCategories(value.split(','))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing,docs,rss,social,news,api,community">All Categories</SelectItem>
                      <SelectItem value="marketing,docs">Marketing & Documentation</SelectItem>
                      <SelectItem value="marketing,social">Marketing & Social</SelectItem>
                      <SelectItem value="docs,api">Documentation & API</SelectItem>
                      <SelectItem value="rss,news">News & RSS Feeds</SelectItem>
                      <SelectItem value="marketing">Marketing Only</SelectItem>
                      <SelectItem value="docs">Documentation Only</SelectItem>
                      <SelectItem value="social">Social Media Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Types of content to scrape</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry Preset Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Industry Preset Groups
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Quick setup with pre-configured companies and categories for different industries
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(INDUSTRY_GROUPINGS).map(([key, preset]) => (
                  <div key={key} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{preset.name}</h4>
                      <Badge variant="outline">{preset.companies.length} companies</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {preset.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedPreset === key ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => loadPresetGroup(key)}
                      >
                        {selectedPreset === key ? 'Selected' : 'Use Preset'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCustomCompanies(preset.companies);
                          setSelectedCategories(preset.categories);
                          setShowTargetSelection(true);
                        }}
                      >
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Companies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Custom Companies
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add your own companies or competitors to monitor
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Add Section */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter company name (e.g., OpenAI, Stripe, Notion)"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      addCompanyWithUrls(e.currentTarget.value.trim());
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="Enter company name"]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      addCompanyWithUrls(input.value.trim());
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </div>
              
              {/* Company List */}
              {customCompanies.filter(c => c.trim()).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Companies to Monitor</h4>
                  {customCompanies.map((company, index) => (
                    <div key={index} className="flex gap-3 items-center p-3 border rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <Input
                          placeholder="Company name"
                          value={company}
                          onChange={(e) => updateCompanyName(index, e.target.value)}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (company.trim()) {
                            setShowTargetSelection(true);
                          }
                        }}
                        disabled={!company.trim()}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Configure Targets
                      </Button>
                      {customCompanies.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCustomCompany(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {customCompanies.filter(c => c.trim()).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No companies added yet</p>
                  <p className="text-sm">Use the input above to add companies or select an industry preset</p>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={addCustomCompany}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </CardContent>
          </Card>

          {/* Target Selection and Configuration */}
          {showTargetSelection && customCompanies.filter(c => c.trim()).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Target Selection & Configuration
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and customize the generated link targets for each company
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={selectAllTargets}
                    size="sm"
                    variant="outline"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Select All Companies
                  </Button>
                  <Button
                    onClick={clearAllTargets}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Companies
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary Section */}
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Scraping Summary</h4>
                    <Badge variant="default">{getSelectedTargetsCount()} targets selected</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Companies:</span> {customCompanies.filter(c => c.trim()).length}
                    </div>
                    <div>
                      <span className="font-medium">Categories:</span> {selectedCategories.length}
                    </div>
                    <div>
                      <span className="font-medium">Estimated Pages:</span> {getSelectedTargetsCount() * limit}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <Badge variant="outline" className="ml-2">
                        {getSelectedTargetsCount() > 0 ? 'Ready to Scrape' : 'No Targets Selected'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {customCompanies.filter(c => c.trim()).map((company) => {
                  const targets = linkTargetingService.generateLinkTargets(company, selectedCategories);
                  const companySelectedTargets = selectedTargets.get(company) || new Set();
                  
                  return (
                    <div key={company} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-lg">{company}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {companySelectedTargets.size} of {targets.length} selected
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => selectAllTargetsForCompany(company)}
                          >
                            Select All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => clearAllTargetsForCompany(company)}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {targets.map((target, index) => {
                          const isSelected = isTargetSelected(company, target.category);
                          const currentUrl = companyUrls[company]?.[target.category] || target.url;
                          
                          return (
                            <div 
                              key={index} 
                              className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                                isSelected 
                                  ? 'border-primary bg-primary/5 shadow-sm' 
                                  : 'border-border hover:border-primary/30'
                              }`}
                              onClick={() => toggleTargetSelection(company, target.category)}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleTargetSelection(company, target.category)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span className="font-medium text-sm capitalize">{target.category}</span>
                                </div>
                                <Badge variant={target.priority === 'high' ? 'default' : target.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                                  {target.priority}
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                  {target.description}
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium">URL</Label>
                                  <Input
                                    value={currentUrl}
                                    onChange={(e) => updateTargetUrl(company, target.category, e.target.value)}
                                    placeholder="URL"
                                    className="text-xs h-8"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-6 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(target.url, '_blank');
                                    }}
                                  >
                                    Test Original
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-6 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (currentUrl !== target.url) {
                                        updateTargetUrl(company, target.category, target.url);
                                      }
                                    }}
                                  >
                                    Reset
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {targets.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>No targets generated for {company}</p>
                          <p className="text-sm">Try selecting different categories</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Scraping Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Start Scraping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Scraping Summary</h4>
                  <Badge variant="default">{getSelectedTargetsCount()} targets selected</Badge>
                </div>
                
                {getSelectedTargetsCount() > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Array.from(selectedTargets.entries()).map(([company, categories]) => (
                      <div key={company} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{company}</Badge>
                        <span className="text-muted-foreground">→</span>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(categories).map(category => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No targets selected. Configure companies and select targets above.
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => runScraping(getFinalScrapingTargets())}
                  disabled={isLoading || getSelectedTargetsCount() === 0 || backendStatus !== 'connected'}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isLoading ? 'Scraping...' : `Start Scraping (${getSelectedTargetsCount()} targets)`}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={selectAllTargets}
                  disabled={getSelectedTargetsCount() === 0}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Select All Companies
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearAllTargets}
                  disabled={getSelectedTargetsCount() === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Companies
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportCSV} 
                  disabled={dbItems.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Import Files
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload existing documents to include in your analysis
              </p>
            </CardHeader>
            <CardContent>
              <Input 
                type="file" 
                accept=".csv,.md,.markdown,.docx" 
                onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} 
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: CSV, Markdown, DOCX
              </p>
            </CardContent>
          </Card>

          {/* AI Analysis Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Analysis Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure AI analysis to run after scraping is complete
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">OpenAI API Configuration</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={useBackendKey} 
                      onCheckedChange={setUseBackendKey} 
                    />
                    <Label>Use backend API key (recommended)</Label>
                  </div>
                  
                  {!useBackendKey && (
                    <div className="space-y-2">
                      <Label>Frontend OpenAI API Key</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="password" 
                          value={frontendOpenAIKey} 
                          onChange={e => setFrontendOpenAIKey(e.target.value)} 
                          placeholder="sk-..." 
                        />
                        <Button onClick={() => aiService.setApiKey(frontendOpenAIKey)} variant="secondary">
                          Save
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your API key will be stored locally in the browser
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Analysis Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Analysis Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Analysis Tone</Label>
                    <Select value={analysisTone} onValueChange={(value: 'neutral' | 'confident' | 'skeptical' | 'enthusiastic') => setAnalysisTone(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="confident">Confident</SelectItem>
                        <SelectItem value="skeptical">Skeptical</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Focus Areas</Label>
                    <Input 
                      value={focusAreas}
                      onChange={(e) => setFocusAreas(e.target.value)}
                      placeholder="positioning, differentiation, pricing, risks"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch checked={autoAnalysis} onCheckedChange={setAutoAnalysis} />
                  <Label>Automatically run AI analysis after scraping</Label>
                </div>
              </div>

              {/* AI Analysis Actions */}
              {dbItems.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Run AI Analysis</h4>
                  <div className="flex gap-3">
                    <Button
                      onClick={runAIAnalysis}
                      disabled={isAnalyzing || !hasValidApiKey()}
                      className="flex-1"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Analyze All Content
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={generateCompetitiveSummary}
                      disabled={!hasValidApiKey()}
                      variant="outline"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate Summary
                    </Button>
                  </div>
                  
                  {!hasValidApiKey() && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>OpenAI API key required for AI analysis</p>
                      <p className="text-sm">Enter your API key above or enable backend key usage</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real-Time Data Insights & AI Analysis */}
          {dbItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Real-Time Market Intelligence
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Live insights from your scraped data with AI-powered analysis
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-primary">{dbItems.length}</div>
                    <div className="text-sm text-muted-foreground">Total Pages</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-primary">
                      {Array.from(new Set(dbItems.map(i => i.company))).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Companies</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-primary">
                      {Array.from(new Set(dbItems.map(i => i.category))).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-primary">
                      {dbItems.filter(i => i.sentiment_score !== undefined).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Analyzed</div>
                  </div>
                </div>

                {/* Content Insights Dashboard */}
                <div className="space-y-6">
                  <h4 className="font-medium text-lg">Content Insights Dashboard</h4>
                  
                  {/* Content Type Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium">Content Distribution by Category</h5>
                      <div className="space-y-3">
                        {Object.entries(
                          dbItems.reduce((acc, item) => {
                            acc[item.category] = (acc[item.category] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                        .sort(([,a], [,b]) => b - a)
                        .map(([category, count]) => {
                          const percentage = ((count / dbItems.length) * 100).toFixed(1);
                          const categoryItems = dbItems.filter(i => i.category === category);
                          const avgWords = Math.round(
                            categoryItems.reduce((acc, i) => acc + (i.markdown?.split(/\s+/).length || 0), 0) / count
                          );
                          
                          return (
                            <div key={category} className="p-3 border rounded-lg bg-muted/30">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium capitalize">{category}</span>
                                <Badge variant="outline">{count} pages</Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">Share:</span>
                                  <span className="font-medium">{percentage}%</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">Avg Words:</span>
                                  <span className="font-medium">{avgWords}</span>
                                </div>
                                {categoryItems.some(i => i.sentiment_score !== undefined) && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">Sentiment:</span>
                                    <Badge variant="outline" className="text-xs">
                                      {categoryItems.filter(i => i.sentiment_score !== undefined).length} analyzed
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-medium">Content Quality Metrics</h5>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Total Content Volume</span>
                            <Badge variant="outline">
                              {Math.round(dbItems.reduce((acc, i) => acc + (i.markdown?.length || 0), 0) / 1000)}K chars
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dbItems.reduce((acc, i) => acc + (i.markdown?.split(/\s+/).length || 0), 0).toLocaleString()} words across all content
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">AI Analysis Coverage</span>
                            <Badge variant="outline">
                              {((dbItems.filter(i => i.sentiment_score !== undefined).length / dbItems.length) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dbItems.filter(i => i.sentiment_score !== undefined).length} of {dbItems.length} items analyzed
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Content Freshness</span>
                            <Badge variant="outline">
                              {dbItems.filter(i => {
                                const days = (new Date().getTime() - new Date(i.scrapedAt).getTime()) / (1000 * 60 * 60 * 24);
                                return days <= 7;
                              }).length} recent
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Content from last 7 days: {dbItems.filter(i => {
                              const days = (new Date().getTime() - new Date(i.scrapedAt).getTime()) / (1000 * 60 * 60 * 24);
                              return days <= 7;
                            }).length} items
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Preview Showcase */}
                  <div className="space-y-4">
                    <h5 className="font-medium">Content Preview Showcase</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dbItems
                        .filter(i => i.markdown && i.markdown.length > 100)
                        .slice(0, 4)
                        .map((item, index) => (
                          <div key={item.id || index} className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">{item.company}</Badge>
                              <Badge variant="secondary" className="text-xs capitalize">{item.category}</Badge>
                              {item.sentiment_score !== undefined && (
                                <Badge variant={item.sentiment_score > 0 ? 'default' : item.sentiment_score < 0 ? 'destructive' : 'outline'} className="text-xs">
                                  {item.sentiment_score > 0 ? '😊' : item.sentiment_score < 0 ? '😟' : '😐'}
                                </Badge>
                              )}
                            </div>
                            
                            <h6 className="font-medium mb-2 text-sm line-clamp-2">
                              {item.title || 'Untitled Content'}
                            </h6>
                            
                            <div className="text-xs text-muted-foreground mb-3 line-clamp-3">
                              {item.markdown?.slice(0, 150)}...
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {item.markdown?.split(/\s+/).length || 0} words
                              </span>
                              <span className="text-muted-foreground">
                                {new Date(item.scrapedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* AI Analysis Insights Preview */}
                  {dbItems.some(i => i.ai_analysis) && (
                    <div className="space-y-4">
                      <h5 className="font-medium">AI Analysis Insights Preview</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dbItems
                          .filter(i => i.ai_analysis && i.key_topics && i.key_topics.length > 0)
                          .slice(0, 4)
                          .map((item, index) => (
                            <div key={item.id || index} className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                              <div className="flex items-center gap-2 mb-3">
                                <Brain className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-sm">{item.company}</span>
                                <Badge variant="outline" className="text-xs capitalize">{item.category}</Badge>
                              </div>
                              
                              <div className="space-y-3">
                                {item.key_topics && item.key_topics.length > 0 && (
                                  <div>
                                    <span className="text-xs font-medium text-green-700">Key Topics:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.key_topics.slice(0, 3).map((topic, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs bg-green-100">
                                          {topic}
                                        </Badge>
                                      ))}
                                      {item.key_topics.length > 3 && (
                                        <Badge variant="outline" className="text-xs bg-green-100">
                                          +{item.key_topics.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {item.ai_analysis && (
                                  <div>
                                    <span className="text-xs font-medium text-green-700">AI Insight:</span>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {item.ai_analysis}
                                    </p>
                                  </div>
                                )}
                                
                                {item.sentiment_score !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-green-700">Sentiment:</span>
                                    <Badge variant={item.sentiment_score > 0 ? 'default' : item.sentiment_score < 0 ? 'destructive' : 'outline'} className="text-xs">
                                      {item.sentiment_score > 0 ? 'Positive' : item.sentiment_score < 0 ? 'Negative' : 'Neutral'} ({item.sentiment_score.toFixed(2)})
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Use Case Examples */}
                  <div className="space-y-4">
                    <h5 className="font-medium">AI Analysis Use Case Examples</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-violet-50">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageCircle className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-sm">Customer Reviews</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Analyze thousands of customer reviews to understand sentiment trends, common complaints, and feature requests.
                        </p>
                        <div className="text-xs text-purple-700">
                          <strong>Example:</strong> "Analyze 2,500+ customer reviews across 15 companies to identify top pain points and satisfaction drivers"
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-amber-50">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-sm">Market Trends</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Track emerging trends, product launches, and market positioning across competitors over time.
                        </p>
                        <div className="text-xs text-orange-700">
                          <strong>Example:</strong> "Monitor 50+ tech companies for AI product announcements and feature comparisons"
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4 text-teal-600" />
                          <span className="font-medium text-sm">Competitive Intel</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Understand competitor strategies, pricing changes, and market positioning in real-time.
                        </p>
                        <div className="text-xs text-teal-700">
                          <strong>Example:</strong> "Track pricing changes, feature updates, and marketing campaigns across 20 SaaS competitors"
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick AI Analysis Actions */}
                  <div className="space-y-4">
                    <h5 className="font-medium">Quick AI Analysis Actions</h5>
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        onClick={() => runContentIntelligenceAnalysis()}
                        disabled={isAnalyzing || !hasValidApiKey()}
                        size="sm"
                        variant="outline"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Content Intelligence
                      </Button>
                      <Button
                        onClick={() => runTrendDetectionAnalysis()}
                        disabled={isAnalyzing || !hasValidApiKey()}
                        size="sm"
                        variant="outline"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Trend Detection
                      </Button>
                      <Button
                        onClick={() => runMarketSentimentAnalysis()}
                        disabled={isAnalyzing || !hasValidApiKey()}
                        size="sm"
                        variant="outline"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Sentiment Analysis
                      </Button>
                      <Button
                        onClick={() => runComprehensiveAnalysis()}
                        disabled={isAnalyzing || !hasValidApiKey()}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Run All Analysis
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Company Performance Summary */}
                <div className="space-y-4">
                  <h4 className="font-medium">Company Performance Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(new Set(dbItems.map(i => i.company))).slice(0, 6).map(company => {
                      const companyItems = dbItems.filter(i => i.company === company);
                      const categories = Array.from(new Set(companyItems.map(i => i.category)));
                      const avgSentiment = companyItems
                        .filter(i => i.sentiment_score !== undefined)
                        .reduce((acc, i) => acc + (i.sentiment_score || 0), 0) / 
                        companyItems.filter(i => i.sentiment_score !== undefined).length;
                      
                      return (
                        <div key={company} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{company}</h5>
                            <Badge variant="outline">{companyItems.length} pages</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {categories.map(cat => (
                                <Badge key={cat} variant="secondary" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                            {!isNaN(avgSentiment) && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Avg Sentiment:</span>
                                <Badge variant={avgSentiment > 0.1 ? 'default' : avgSentiment < -0.1 ? 'destructive' : 'outline'}>
                                  {avgSentiment > 0.1 ? '😊' : avgSentiment < -0.1 ? '😟' : '😐'} {avgSentiment.toFixed(2)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Content Analysis */}
                <div className="space-y-4">
                  <h4 className="font-medium">Content Analysis & Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-3">Category Distribution</h5>
                      <div className="space-y-2">
                        {Object.entries(
                          dbItems.reduce((acc, item) => {
                            acc[item.category] = (acc[item.category] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{category}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-medium mb-3">Recent Activity</h5>
                      <div className="space-y-2">
                        {dbItems
                          .sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime())
                          .slice(0, 5)
                          .map(item => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{item.company}</Badge>
                                <span className="text-muted-foreground capitalize">{item.category}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.scrapedAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI-Powered Market Analysis */}
                <div className="space-y-4">
                  <h4 className="font-medium">AI-Powered Market Analysis</h4>
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Intelligent Market Insights</span>
                    </div>
                    
                    {competitiveSummary ? (
                      <div className="space-y-3">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap bg-white p-3 rounded border">{competitiveSummary}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => runAIAnalysis()}
                            disabled={isAnalyzing || !hasValidApiKey()}
                            size="sm"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Analysis
                          </Button>
                          <Button
                            onClick={() => setCompetitiveSummary('')}
                            variant="outline"
                            size="sm"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-blue-800">
                          Generate AI-powered insights from your scraped data to understand market trends, 
                          competitive positioning, and strategic opportunities.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={generateCompetitiveSummary}
                            disabled={!hasValidApiKey()}
                            size="sm"
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Generate Market Analysis
                          </Button>
                          <Button
                            onClick={() => runAIAnalysis()}
                            disabled={isAnalyzing || !hasValidApiKey()}
                            variant="outline"
                            size="sm"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Analyze All Content
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Export & Share */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={exportCSV} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data (CSV)
                  </Button>
                  <Button 
                    onClick={clearAllData} 
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Link Targeting Dashboard */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Enhanced Link Targeting</h3>
                  <p className="text-sm text-muted-foreground">
                    Intelligent URL generation with pattern learning and success rate tracking
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  AI-Powered
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Pattern Success Rates */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Pattern Success Rates</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {(() => {
                      const stats = enhancedLinkTargetingService.getSuccessRateStats();
                      const avgRate = Object.values(stats).reduce((a, b) => a + b, 0) / Math.max(Object.values(stats).length, 1);
                      return `${(avgRate * 100).toFixed(1)}%`;
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average success rate across all patterns
                  </p>
                </div>
                
                {/* Total Patterns */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Total Patterns</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const stats = enhancedLinkTargetingService.getSuccessRateStats();
                      return Object.keys(stats).length;
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Learned patterns across companies
                  </p>
                </div>
                
                {/* Enhanced Coverage */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Enhanced Coverage</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const industryGroupings = getIndustryGroupings();
                      let totalPatterns = 0;
                      let totalEnhanced = 0;
                      
                      Object.values(industryGroupings).forEach(config => {
                        Object.values(config.linkPatterns).forEach(patterns => {
                          totalPatterns += patterns.length;
                          totalEnhanced += patterns.length * 3; // Subcategories + regional + alternatives
                        });
                      });
                      
                      return `${totalEnhanced.toLocaleString()}`;
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total enhanced targeting URLs available
                  </p>
                </div>
              </div>
              
              {/* Pattern Learning Status */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Pattern Learning Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(getIndustryGroupings()).slice(0, 4).map(([industry, config]) => (
                    <div key={industry} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{config.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {config.companies.length} companies • {Object.keys(config.linkPatterns).length} categories
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {config.categories.length} patterns
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium text-sm mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const stats = enhancedLinkTargetingService.getSuccessRateStats();
                      console.log('Pattern Success Rates:', stats);
                      toast({ title: 'Success rates logged to console', description: 'Check browser console for detailed pattern statistics' });
                    }}
                  >
                    View Success Rates
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Simulate pattern learning from successful scrapes
                      const testCompanies = ['OpenAI', 'Stripe', 'Notion'];
                      testCompanies.forEach(company => {
                        enhancedLinkTargetingService.learnFromSuccess(company, 'marketing', [`https://www.${company.toLowerCase()}.com/features`]);
                      });
                      toast({ title: 'Pattern learning updated', description: 'Success rates updated based on recent scraping results' });
                    }}
                  >
                    Update Learning
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Show enhanced targeting capabilities
                      const demoCompany = 'DemoCorp';
                      const demoUrls = enhancedLinkTargetingService.generateIntelligentUrls(demoCompany, ['marketing', 'docs', 'api']);
                      console.log('Enhanced Targeting Demo:', demoUrls);
                      toast({ 
                        title: 'Enhanced targeting demo', 
                        description: `Generated ${Object.keys(demoUrls).length} URLs for ${demoCompany}. Check console for details.` 
                      });
                    }}
                  >
                    Demo Targeting
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
