import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useFlagValidation() {
  const [isValidating, setIsValidating] = useState(false);

  const validateFlag = async (flag: string, level: number, playerName: string, solveToken: string | null) => {
    if (!flag.trim() || !playerName.trim()) {
      toast({ title: "Erro", description: "Flag e nome do jogador são obrigatórios", variant: "destructive" });
      return false;
    }
    if (!solveToken) {
      toast({
        title: "Token de solve ausente",
        description: "Gere uma resposta válida no chat antes de submeter a flag.",
        variant: "destructive",
      });
      return false;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-flag", {
        body: { flag: flag.trim(), level, player_name: playerName.trim(), solve_token: solveToken },
      });

      if (error) throw error;

      toast({
        title: data.valid ? "🎉 Solve Registrado" : "❌ Submissão Inválida",
        description: data.message,
        variant: data.valid ? "default" : "destructive",
      });

      return data.valid;
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha na validação", variant: "destructive" });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return { validateFlag, isValidating };
}
