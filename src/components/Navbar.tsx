import { Link, useLocation } from "react-router-dom";
import { Shield, Terminal, Trophy } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Início", icon: Terminal },
  { path: "/level/1", label: "Nível 1", icon: Shield },
  { path: "/level/2", label: "Nível 2", icon: Shield },
  { path: "/level/3", label: "Nível 3", icon: Shield },
  { path: "/scoreboard", label: "Placar", icon: Trophy },
];

export function Navbar() {
  const location = useLocation();

  const scrollToTop = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-14 gap-6">
          <Link to="/" onClick={scrollToTop} className="flex items-center gap-2 glow-text font-display font-bold text-lg">
            <Terminal className="w-5 h-5" />
            <span>PI_LAB</span>
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={scrollToTop}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap ${
                    active
                      ? "bg-primary/10 text-primary glow-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
