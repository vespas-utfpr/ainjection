import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useFlagValidation() {
  const [isValidating, setIsValidating] = useState(false);

  const validateFlag = async (flag: string, level: number, playerName: string) => {
    if (!flag.trim() || !playerName.trim()) {
      toast({ title: "Error", description: "Flag and player name are required", variant: "destructive" });
      return false;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-flag", {
        body: { flag: flag.trim(), level, player_name: playerName.trim() },
      });

      if (error) throw error;

      toast({
        title: data.valid ? "🎉 Flag Captured!" : "❌ Wrong Flag",
        description: data.message,
        variant: data.valid ? "default" : "destructive",
      });

      return data.valid;
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Validation failed", variant: "destructive" });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return { validateFlag, isValidating };
}
