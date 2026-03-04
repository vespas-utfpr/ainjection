import { useParams, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { TerminalChat } from "@/components/TerminalChat";
import { FlagSubmit } from "@/components/FlagSubmit";
import { useCTFChat } from "@/hooks/use-ctf-chat";
import { useFlagValidation } from "@/hooks/use-flag-validation";
import { LEVELS } from "@/lib/levels";
import { AlertTriangle, Info, Target } from "lucide-react";

export default function LevelPage() {
  const { id } = useParams();
  const levelId = Number(id);
  const level = LEVELS.find((l) => l.id === levelId);

  const { messages, isLoading, sendMessage, clearMessages, latestSolveToken } = useCTFChat(levelId);
  const { validateFlag, isValidating } = useFlagValidation();

  if (!level) return <Navigate to="/" replace />;

  const difficultyColor =
    level.difficulty === "Fácil"
      ? "text-primary"
      : level.difficulty === "Médio"
        ? "text-terminal-amber"
        : "text-terminal-red";

  return (
    <div className="min-h-screen bg-background scanline-overlay">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Cabeçalho */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-0.5 border border-border rounded bg-secondary text-muted-foreground">
              NÍVEL {level.id}
            </span>
            <span className={`text-xs font-bold ${difficultyColor}`}>
              {level.difficulty.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold glow-text">{level.title}</h1>
          <p className="text-sm text-muted-foreground">{level.description}</p>
        </div>

        {/* Objetivo */}
        <div className="flex items-start gap-2 text-xs border border-border rounded p-3 bg-card">
          <Target className="w-4 h-4 text-terminal-cyan mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-terminal-cyan">Objetivo: </span>
            <span className="text-secondary-foreground">{level.objective}</span>
          </div>
        </div>

        {/* Dica */}
        <details className="border border-border rounded bg-card">
          <summary className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            <Info className="w-3.5 h-3.5" />
            Mostrar Dica
          </summary>
          <div className="px-3 pb-3 text-xs text-terminal-amber flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {level.hint}
          </div>
        </details>

        {/* Info do filtro do Level 3 */}
        {levelId === 3 && (
          <div className="border border-terminal-red/30 rounded p-3 bg-terminal-red/5 text-xs text-terminal-red">
            <span className="font-bold">⚠ Policy Gate Ativo:</span> Requisições sensíveis sem marcador de aprovação
            serão negadas antes da execução no modelo.
          </div>
        )}

        {/* Chat */}
        <TerminalChat
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onClear={clearMessages}
          levelId={levelId}
        />

        {/* Submissão de flag */}
        <FlagSubmit
          level={levelId}
          onSubmit={(flag, currentLevel, playerName) =>
            validateFlag(flag, currentLevel, playerName, latestSolveToken)}
          isValidating={isValidating}
        />
      </main>
    </div>
  );
}
