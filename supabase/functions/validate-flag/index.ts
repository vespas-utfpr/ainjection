import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FLAGS: Record<number, string> = {
  1: "FLAG{syst3m_pr0mpt_l34k3d}",
  2: "FLAG{1nd1r3ct_1nj3ct10n_ftw}",
  3: "FLAG{f1lt3r_byp4ss_m4st3r}",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { flag, level, player_name } = await req.json();

    const levelNum = Number(level);
    if (!levelNum || levelNum < 1 || levelNum > 3) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid level" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!player_name || typeof player_name !== "string" || player_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ valid: false, error: "Player name required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (player_name.length > 50) {
      return new Response(
        JSON.stringify({ valid: false, error: "Player name too long (max 50 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isValid = flag === FLAGS[levelNum];

    if (isValid) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("scoreboard").insert({
        player_name: player_name.trim().slice(0, 50),
        level: levelNum,
      });
    }

    return new Response(
      JSON.stringify({
        valid: isValid,
        message: isValid
          ? `🎉 Correct! Level ${levelNum} completed!`
          : "❌ Incorrect flag. Keep trying!",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("validate-flag error:", e);
    return new Response(
      JSON.stringify({ valid: false, error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
