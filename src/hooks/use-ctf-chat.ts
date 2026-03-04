import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  filtered?: boolean;
  solveToken?: string | null;
}

export function useCTFChat(level: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [latestSolveToken, setLatestSolveToken] = useState<string | null>(null);

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
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setLatestSolveToken(null);
  };

  return { messages, isLoading, sendMessage, clearMessages, latestSolveToken };
}
