import { useState, useRef, useEffect } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  filtered?: boolean;
}

interface TerminalChatProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (msg: string) => void;
  onClear: () => void;
  levelId: number;
}

export function TerminalChat({ messages, isLoading, onSend, onClear, levelId }: TerminalChatProps) {
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [levelId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-border rounded bg-background glow-border">
      {/* Cabeçalho do terminal */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-terminal-red" />
          <div className="w-2.5 h-2.5 rounded-full bg-terminal-amber" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground ml-2">nivel_{levelId}_terminal</span>
        </div>
        <button
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Limpar chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mensagens */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-xs">
            {'>'} Conectado ao MadrugaBot v3.{levelId}...
            <br />
            {'>'} Sessão iniciada. Envie sua requisição para a IA da Vila.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="space-y-1">
            <span
              className={`text-xs font-bold ${
                msg.role === "user" ? "text-terminal-cyan" : msg.filtered ? "text-terminal-red" : "text-primary"
              }`}
            >
              {msg.role === "user" ? "voce@vila" : "madrugabot@secure"}:~$
            </span>
            <p className={`pl-2 text-xs leading-relaxed whitespace-pre-wrap ${
              msg.filtered ? "text-terminal-red" : "text-secondary-foreground"
            }`}>
              {msg.content}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processando...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center border-t border-border p-2 gap-2">
        <span className="text-terminal-cyan text-xs">$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Envie uma mensagem..."
          className="flex-1 bg-transparent text-foreground text-xs outline-none placeholder:text-muted-foreground"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
