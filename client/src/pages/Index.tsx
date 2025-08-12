import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Brain, 
  Target, 
  BarChart3, 
  Zap, 
  Shield,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <SEO 
        title="InsightForge | Competitive Intelligence Platform" 
        description="Scrape, analyze, and compare competitors with AI-driven insights and visuals." 
        canonical={window.location.href} 
      />
      
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 opacity-30" aria-hidden>
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary to-accent blur-3xl" />
      </div>
      
      {/* Hero Section */}
      <section className="container mx-auto py-28 flex flex-col items-center text-center gap-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <Badge variant="secondary" className="text-sm">Frontend Ready</Badge>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Holistic Competitive Intelligence
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl">
          Crawl marketing sites, docs, feeds, and social signals. Turn raw data into crisp, actionable visuals and battlecards.
        </p>
        
        <div className="flex gap-3">
          <Link to="/scrape">
            <Button variant="default" size="lg" className="gap-2">
              <Globe className="h-5 w-5" />
              Start Scraping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/analysis">
            <Button variant="secondary" size="lg" className="gap-2">
              <Brain className="h-5 w-5" />
              AI Analysis
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container mx-auto py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Web Scraping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Intelligent web scraping with preset industry groups and custom targeting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                OpenAI-powered competitive intelligence with sentiment analysis and insights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                Battlecards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate competitive battlecards with strategic insights and recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive analytics dashboard with data visualization and insights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Real-time Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Live progress monitoring and real-time data updates during scraping.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-500" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Secure data handling with GDPR compliance and enterprise-grade security.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Status Section */}
      <section className="container mx-auto py-16">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✅</div>
                <div className="text-sm font-medium">Frontend Ready</div>
                <div className="text-xs text-muted-foreground">React + TypeScript</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">🔧</div>
                <div className="text-sm font-medium">Backend Running</div>
                <div className="text-xs text-muted-foreground">Port 3001</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">🧠</div>
                <div className="text-sm font-medium">AI Integration</div>
                <div className="text-xs text-muted-foreground">OpenAI Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Index;
