import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { LEVELS } from "@/lib/levels";
import { Shield, ChevronRight, Skull, Terminal } from "lucide-react";
import heroImage from "@/ainjection-ia-slop.webp";

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
            <span className="text-terminal-amber">na Vila</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Explore 3 desafios progressivos inspirados no universo do Seu Madruga.
            Extraia flags de sistemas de IA abusando de fronteiras de confiança
            (<em>trust boundaries</em>), conteúdo recuperado (<em>retrieved content</em>) por pipeline e
            <em> prompt injection</em>.
          </p>
          <img
            src={heroImage}
            alt="Ilustração do desafio ainjection"
            className="mx-auto mt-6 w-full max-w-[224px] rounded-lg border border-border/70 shadow-lg"
          />
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
              <p>Cada nível simula um fluxo de produto com IA. Sua tarefa é induzir um comportamento inseguro plausível.</p>
            </div>
            <div className="space-y-1">
              <span className="text-terminal-amber font-bold">02.</span> Explore a Fronteira
              <p>
                Use <em>prompt injection</em>, conteúdo recuperado (<em>retrieved content</em>) ou confusão de metadado (<em>metadata</em>)
                para cruzar a barreira errada.
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-terminal-red font-bold">03.</span> Envie e Pontue
              <p>Envie a flag e registre no placar a prova de exploração emitida pela interação válida.</p>
            </div>
          </div>
        </div>

        {/* Level cards */}
        <div className="mt-12 space-y-4">
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

      </main>
    </div>
  );
}
