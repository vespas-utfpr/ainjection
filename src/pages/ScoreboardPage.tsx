import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { LEVELS } from "@/lib/levels";
import { Trophy, Clock, User, Loader2 } from "lucide-react";

interface ScoreEntry {
  id: string;
  player_name: string;
  level: number;
  solved_at: string;
}

export default function ScoreboardPage() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      const { data, error } = await supabase
        .from("scoreboard")
        .select("*")
        .order("solved_at", { ascending: true })
        .limit(100);

      if (!error && data) {
        setScores(data as ScoreEntry[]);
      }
      setLoading(false);
    };
    fetchScores();
  }, []);

  const levelLabel = (l: number) => LEVELS.find((level) => level.id === l)?.title ?? "Nível desconhecido";

  const levelColor = (l: number) =>
    l === 1 ? "text-primary" : l === 2 ? "text-terminal-amber" : "text-terminal-red";

  return (
    <div className="min-h-screen bg-background scanline-overlay">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-terminal-amber" />
          <h1 className="text-2xl font-display font-bold glow-text">Placar</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Carregando pontuações...
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Nenhuma flag capturada ainda. Seja o primeiro!
          </div>
        ) : (
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-card border-b border-border text-muted-foreground">
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">Jogador</th>
                  <th className="text-left px-4 py-3">Nível</th>
                  <th className="text-left px-4 py-3">Horário</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((entry, i) => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-terminal-cyan" />
                      <span className="text-foreground font-medium">{entry.player_name}</span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${levelColor(entry.level)}`}>
                      N{entry.level}: {levelLabel(entry.level)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(entry.solved_at).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
