import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";

interface FlagSubmitProps {
  level: number;
  onSubmit: (flag: string, level: number, playerName: string) => Promise<boolean>;
  isValidating: boolean;
}

export function FlagSubmit({ level, onSubmit, isValidating }: FlagSubmitProps) {
  const [flag, setFlag] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [solved, setSolved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmit(flag, level, playerName);
    if (result) {
      setSolved(true);
    }
  };

  if (solved) {
    return (
      <div className="border border-primary rounded p-4 bg-primary/5 glow-border pulse-glow">
        <div className="flex items-center gap-2 text-primary glow-text">
          <Flag className="w-5 h-5" />
          <span className="font-display font-bold">Nível {level} Concluído!</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Flag validada e solução registrada no placar.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded p-4 bg-card space-y-3">
      <div className="flex items-center gap-2 text-foreground">
        <Flag className="w-4 h-4" />
        <span className="text-sm font-display font-semibold">Enviar Flag</span>
      </div>
      <input
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Nome do jogador"
        maxLength={50}
        className="w-full bg-background border border-border rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
      />
      <div className="flex gap-2">
        <input
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="FLAG{...}"
          className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
        />
        <button
          type="submit"
          disabled={isValidating || !flag.trim() || !playerName.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {isValidating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Enviar
        </button>
      </div>
    </form>
  );
}
