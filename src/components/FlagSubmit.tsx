import { useState } from "react";
import { Check, Copy, Flag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FlagSubmitProps {
  level: number;
  latestFlag: string | null;
}

export function FlagSubmit({ level, latestFlag }: FlagSubmitProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!latestFlag) return;
    try {
      await navigator.clipboard.writeText(latestFlag);
      setCopied(true);
      toast({
        title: "Flag copiada",
        description: "Agora envie a flag na página da challenge no CTFd.",
      });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Copie a flag manualmente e envie no CTFd.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border border-border rounded p-4 bg-card space-y-3">
      <div className="flex items-center gap-2 text-foreground">
        <Flag className="w-4 h-4" />
        <span className="text-sm font-display font-semibold">Submeter no CTFd</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Quando o chat revelar a flag do nível {level}, copie o valor abaixo e envie na página da challenge no CTFd.
      </p>
      <div className="flex gap-2 items-stretch">
        <input
          value={latestFlag ?? ""}
          readOnly
          placeholder="VESPAS{...}"
          className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!latestFlag}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copiada" : "Copiar"}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        A validação oficial acontece no CTFd. Este campo serve apenas para facilitar a cópia da flag.
      </p>
    </div>
  );
}
