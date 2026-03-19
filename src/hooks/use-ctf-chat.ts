import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  filtered?: boolean;
  solveToken?: string | null;
}

interface PersistedChatState {
  messages: Message[];
  latestSolveToken: string | null;
}

function storageKeyForLevel(level: number) {
  return `ainjection:chat:level:${level}`;
}

export function useCTFChat(level: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [latestSolveToken, setLatestSolveToken] = useState<string | null>(null);
  const [hydratedLevel, setHydratedLevel] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(storageKeyForLevel(level));
    if (!raw) {
      setMessages([]);
      setLatestSolveToken(null);
      setHydratedLevel(level);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PersistedChatState;
      const persistedMessages = Array.isArray(parsed.messages) ? parsed.messages : [];
      setMessages(persistedMessages);
      setLatestSolveToken(parsed.latestSolveToken ?? null);
    } catch {
      setMessages([]);
      setLatestSolveToken(null);
    } finally {
      setHydratedLevel(level);
    }
  }, [level]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hydratedLevel !== level) return;

    const payload: PersistedChatState = { messages, latestSolveToken };
    window.localStorage.setItem(storageKeyForLevel(level), JSON.stringify(payload));
  }, [level, messages, latestSolveToken, hydratedLevel]);

  const sendMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ctf-challenge", {
        body: { level, message: input.trim() },
      });

      if (error) throw error;

      const assistantMsg: Message = {
        role: "assistant",
        content: data.response,
        filtered: data.filtered,
        solveToken: data.solve_token ?? null,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (data.solve_token) {
        setLatestSolveToken(data.solve_token);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao obter resposta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setLatestSolveToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKeyForLevel(level));
    }
  };

  return { messages, isLoading, sendMessage, clearMessages, latestSolveToken };
}
