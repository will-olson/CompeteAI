import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <SEO title="InsightForge | Competitive Intelligence" description="Scrape, analyze, and compare competitors with AI-driven insights and visuals." canonical={window.location.href} />
      <div className="absolute inset-0 -z-10 opacity-30" aria-hidden>
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary to-accent blur-3xl" />
      </div>
      <section className="container mx-auto py-28 flex flex-col items-center text-center gap-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">Holistic Competitive Intelligence</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">Crawl marketing sites, docs, feeds, and social signals. Turn raw data into crisp, actionable visuals and battlecards.</p>
        <div className="flex gap-3">
          <Link to="/scrape"><Button variant="hero">Start Scraping</Button></Link>
          <Link to="/analysis"><Button variant="secondary">AI Analysis</Button></Link>
        </div>
      </section>
    </main>
  );
};

export default Index;
