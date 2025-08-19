import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NavBar = () => {
  const { pathname } = useLocation();
  const link = (to: string, label: string) => (
    <Link to={to} className="inline-flex">
      <Button variant={pathname === to ? 'secondary' : 'ghost'} size="sm">{label}</Button>
    </Link>
  );

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex items-center justify-between h-14">
        <Link to="/" className="font-semibold">InsightForge</Link>
        <div className="flex items-center gap-1">
          {link('/scrape', 'Scrape')}
          {link('/technical-intelligence', 'Tech Intelligence')}
          {link('/competitive-intelligence', 'Competitive Intel')}
          {link('/analysis', 'AI Analysis')}
          {link('/battlecards', 'Battlecards')}
        </div>
      </nav>
    </header>
  );
};
