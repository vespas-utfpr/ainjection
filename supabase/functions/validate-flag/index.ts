import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FLAGS: Record<number, string> = {
  1: Deno.env.get("FLAG_LEVEL_1") ?? "FLAG{syst3m_pr0mpt_l34k3d}",
  2: Deno.env.get("FLAG_LEVEL_2") ?? "FLAG{1nd1r3ct_1nj3ct10n_ftw}",
  3: Deno.env.get("FLAG_LEVEL_3") ?? "FLAG{f1lt3r_byp4ss_m4st3r}",
};
const SOLVE_TOKEN_SECRET = Deno.env.get("SOLVE_TOKEN_SECRET") ?? "dev-only-change-me";

type SolveTokenPayload = {
  lvl: number;
  fh: string;
  iat: number;
  exp: number;
  jti: string;
};

function base64UrlEncode(input: Uint8Array): string {
  const b64 = btoa(String.fromCharCode(...input));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256Base64Url(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return base64UrlEncode(new Uint8Array(signature));
}

async function verifySolveToken(token: string, level: number, flag: string): Promise<SolveTokenPayload | null> {
  const [payloadB64, providedSig] = token.split(".");
  if (!payloadB64 || !providedSig) return null;

  const expectedSig = await hmacSha256Base64Url(payloadB64, SOLVE_TOKEN_SECRET);
  if (expectedSig !== providedSig) return null;

  let payload: SolveTokenPayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64)) as SolveTokenPayload;
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return null;
  if (payload.lvl !== level) return null;

  const submittedFlagHash = await sha256Hex(flag);
  if (payload.fh !== submittedFlagHash) return null;

  if (!payload.jti || typeof payload.jti !== "string") return null;
  return payload;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { flag, level, player_name, solve_token } = await req.json();

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

    if (!solve_token || typeof solve_token !== "string") {
      return new Response(
        JSON.stringify({ valid: false, error: "Solve token required. Capture a valid solve in chat first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const expectedFlag = FLAGS[levelNum];
    const isValid = flag === expectedFlag;
    const tokenPayload = isValid
      ? await verifySolveToken(solve_token, levelNum, flag)
      : null;

    if (isValid && tokenPayload) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: insertError } = await supabase.from("scoreboard").insert({
        player_name: player_name.trim().slice(0, 50),
        level: levelNum,
        proof_id: tokenPayload.jti,
      });

      if (insertError) {
        const msg = insertError.message.toLowerCase();
        if (msg.includes("scoreboard_unique_player_level") || msg.includes("scoreboard_proof_id_key")) {
          return new Response(
            JSON.stringify({
              valid: false,
              message: "⚠️ Tentativa duplicada detectada para este jogador/nível ou token já utilizado.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        valid: isValid && !!tokenPayload,
        message: isValid && tokenPayload
          ? `🎉 Correct! Level ${levelNum} completed!`
          : "❌ Invalid submission. Capture a fresh solve token in chat and try again.",
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
