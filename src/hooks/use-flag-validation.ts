import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { postJson } from "@/lib/runtime-api";

type ValidateFlagResponse = {
  valid: boolean;
  message: string;
};

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
      const data = await postJson<ValidateFlagResponse>("/api/validate-flag", {
        flag: flag.trim(),
        level,
        player_name: playerName.trim(),
        solve_token: solveToken,
      });

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
