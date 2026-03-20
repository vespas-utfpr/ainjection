import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { type SolveEvidence } from "../../../src/lib/challenge-logic.ts";
import { generateMockAiResponse } from "../../../src/lib/mock-ai.ts";
import { runChallengeTurn, type LlmMessage } from "../../../src/lib/challenge-runtime.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FLAGS: Record<number, string> = {
  1: Deno.env.get("FLAG_LEVEL_1") ?? "VESPAS{syst3m_pr0mpt_l34k3d}",
  2: Deno.env.get("FLAG_LEVEL_2") ?? "VESPAS{1nd1r3ct_1nj3ct10n_ftw}",
  3: Deno.env.get("FLAG_LEVEL_3") ?? "VESPAS{f1lt3r_byp4ss_m4st3r}",
};
const SOLVE_TOKEN_SECRET = Deno.env.get("SOLVE_TOKEN_SECRET") ?? "dev-only-change-me";
const LLM_BACKEND = Deno.env.get("LLM_BACKEND") ?? "ollama";
const OLLAMA_URL = Deno.env.get("OLLAMA_URL") ?? "http://host.docker.internal:11434";
const OLLAMA_MODEL = Deno.env.get("OLLAMA_MODEL") ?? "qwen2.5:3b-instruct";

function base64UrlEncode(input: Uint8Array): string {
  const b64 = btoa(String.fromCharCode(...input));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
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

async function issueSolveToken(evidence: SolveEvidence): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    lvl: evidence.level,
    fh: await sha256Hex(evidence.extractedSecret),
    pk: evidence.proofKind,
    det: evidence.detector,
    iat: now,
    exp: now + 300,
    jti: crypto.randomUUID(),
  };
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(payloadJson));
  const sig = await hmacSha256Base64Url(payloadB64, SOLVE_TOKEN_SECRET);
  return `${payloadB64}.${sig}`;
}

async function callOllama(messages: LlmMessage[]): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages,
      options: {
        temperature: 0.5,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Ollama error:", response.status, errText);
    throw new Error("LLM local indisponível");
  }

  const data = await response.json();
  return data.message?.content?.trim() || "Sem resposta do LLM local.";
}

async function generateResponse(messages: LlmMessage[]): Promise<string> {
  if (LLM_BACKEND === "mock") {
    return generateMockAiResponse(messages);
  }

  if (LLM_BACKEND === "ollama") {
    return callOllama(messages);
  }

  throw new Error(`LLM_BACKEND não suportado: ${LLM_BACKEND}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { level, message } = await req.json();
    const levelNum = Number(level);

    if (!levelNum || levelNum < 1 || levelNum > 3) {
      return new Response(
        JSON.stringify({ error: "Nível inválido. Use 1, 2 ou 3." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let turn;
    try {
      turn = await runChallengeTurn({
        level: levelNum,
        message,
        flags: FLAGS,
        generateResponse,
      });
    } catch (error) {
      console.error("ctf-challenge llm-local-indisponivel:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "LLM local indisponível",
          degraded: true,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const solveToken = turn.solveEvidence ? await issueSolveToken(turn.solveEvidence) : null;

    return new Response(
      JSON.stringify({
        response: turn.response,
        filtered: turn.filtered,
        degraded: turn.degraded,
        solved: turn.solved,
        solve_token: solveToken,
        solve_evidence: turn.solveEvidence
          ? {
            proof_kind: turn.solveEvidence.proofKind,
            detector: turn.solveEvidence.detector,
          }
          : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("ctf-challenge error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
