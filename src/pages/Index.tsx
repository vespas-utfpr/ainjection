import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { LEVELS } from "@/lib/levels";
import { Shield, ChevronRight, Skull, Terminal } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background scanline-overlay">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 border border-border rounded-full bg-card text-muted-foreground mb-4">
            <Skull className="w-3.5 h-3.5 text-terminal-red" />
            CAPTURE THE FLAG
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold glow-text leading-tight">
            Prompt Injection
            <br />
            <span className="text-terminal-amber">Lab</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Aprenda técnicas de injeção de prompt através de 3 desafios progressivamente mais difíceis.
            Extraia flags de sistemas de IA usando injeção direta, ataques indiretos via RAG e bypass de filtros.
          </p>
        </div>

        {/* Level cards */}
        <div className="space-y-4">
          {LEVELS.map((level) => {
            const diffColor =
              level.difficulty === "Fácil"
                ? "text-primary border-primary/30"
                : level.difficulty === "Médio"
                  ? "text-terminal-amber border-terminal-amber/30"
                  : "text-terminal-red border-terminal-red/30";

            return (
              <Link
                key={level.id}
                to={`/level/${level.id}`}
                className="block border border-border rounded p-5 bg-card hover:bg-secondary/50 transition-all group glow-border hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <h2 className="font-display font-semibold text-lg text-foreground">
                        Nível {level.id}: {level.title}
                      </h2>
                      <span className={`text-[10px] font-bold px-2 py-0.5 border rounded ${diffColor}`}>
                        {level.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{level.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mt-12 border border-border rounded p-6 bg-card">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            Como Funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div className="space-y-1">
              <span className="text-primary font-bold">01.</span> Converse com a IA
              <p>Cada nível tem uma IA com uma flag oculta. Use injeção de prompt para extraí-la.</p>
            </div>
            <div className="space-y-1">
              <span className="text-terminal-amber font-bold">02.</span> Encontre a Flag
              <p>Flags seguem o formato FLAG&#123;...&#125;. Cada nível possui uma flag única.</p>
            </div>
            <div className="space-y-1">
              <span className="text-terminal-red font-bold">03.</span> Envie e Pontue
              <p>Envie sua flag com seu nome de jogador para aparecer no placar.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
