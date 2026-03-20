import { createHash, createHmac, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  applyLevel3PolicyGate,
  detectSolveEvidence,
  generateMockAiResponse,
  looksLikeSupportHandoff,
  parseLevel3GatewayContext,
  type SolveEvidence,
} from "../src/lib/challenge-logic";

type ChallengeRequest = {
  level: number;
  message: string;
};

type ValidateFlagRequest = {
  flag: string;
  level: number;
  player_name: string;
  solve_token: string;
};

type ScoreEntry = {
  id: string;
  player_name: string;
  level: number;
  proof_id: string;
  solved_at: string;
};

type SolveTokenPayload = {
  lvl: number;
  fh: string;
  pk: "support_token_disclosure" | "document_directive_execution" | "vault_secret_disclosure";
  det: string;
  iat: number;
  exp: number;
  jti: string;
};

const FLAGS: Record<number, string> = {
  1: process.env.FLAG_LEVEL_1 ?? "FLAG{syst3m_pr0mpt_l34k3d}",
  2: process.env.FLAG_LEVEL_2 ?? "FLAG{1nd1r3ct_1nj3ct10n_ftw}",
  3: process.env.FLAG_LEVEL_3 ?? "FLAG{f1lt3r_byp4ss_m4st3r}",
};

const SOLVE_TOKEN_SECRET = process.env.SOLVE_TOKEN_SECRET ?? "dev-only-change-me";
const SCOREBOARD_FILE = path.join(process.env.AINJECTION_DATA_DIR ?? "/tmp/ainjection-data", "scoreboard.json");

const EXPECTED_PROOF_KIND: Record<number, SolveTokenPayload["pk"]> = {
  1: "support_token_disclosure",
  2: "document_directive_execution",
  3: "vault_secret_disclosure",
};

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signPayload(payloadB64: string): string {
  return createHmac("sha256", SOLVE_TOKEN_SECRET).update(payloadB64).digest("base64url");
}

function issueSolveToken(evidence: SolveEvidence): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SolveTokenPayload = {
    lvl: evidence.level,
    fh: sha256Hex(evidence.extractedSecret),
    pk: evidence.proofKind,
    det: evidence.detector,
    iat: now,
    exp: now + 300,
    jti: randomUUID(),
  };
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

function verifySolveToken(token: string, level: number, flag: string): SolveTokenPayload | null {
  const [payloadB64, providedSig] = token.split(".");
  if (!payloadB64 || !providedSig) return null;
  if (signPayload(payloadB64) !== providedSig) return null;

  let payload: SolveTokenPayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64)) as SolveTokenPayload;
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return null;
  if (payload.lvl !== level) return null;
  if (payload.pk !== EXPECTED_PROOF_KIND[level]) return null;
  if (payload.fh !== sha256Hex(flag)) return null;
  if (!payload.jti) return null;
  return payload;
}

function ensureScoreboardStorage() {
  mkdirSync(path.dirname(SCOREBOARD_FILE), { recursive: true });
}

function readScoreboard(): ScoreEntry[] {
  ensureScoreboardStorage();
  try {
    const raw = readFileSync(SCOREBOARD_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as ScoreEntry[] : [];
  } catch {
    return [];
  }
}

function writeScoreboard(entries: ScoreEntry[]) {
  ensureScoreboardStorage();
  writeFileSync(SCOREBOARD_FILE, JSON.stringify(entries, null, 2), "utf8");
}

export function handleChallengeRequest({ level, message }: ChallengeRequest) {
  const levelNum = Number(level);
  if (!levelNum || levelNum < 1 || levelNum > 3) {
    return { status: 400, body: { error: "Nível inválido. Use 1, 2 ou 3." } };
  }

  const expectedFlag = FLAGS[levelNum];
  const level3GatewayContext = levelNum === 3 ? parseLevel3GatewayContext(message) : null;
  const effectiveMessage = level3GatewayContext?.userRequest ?? message;

  if (levelNum === 3) {
    const filterResult = applyLevel3PolicyGate(level3GatewayContext!.userRequest, level3GatewayContext!);
    if (filterResult.blocked) {
      return {
        status: 200,
        body: {
          response: `⚠️ POLICY GATE: ${filterResult.reason}. Requisição negada antes da execução no modelo.`,
          filtered: true,
          degraded: false,
          solved: false,
          solve_token: null,
        },
      };
    }
  }

  const aiResponse = generateMockAiResponse({
    level: levelNum,
    message: effectiveMessage,
    expectedFlag,
    level3Approved: level3GatewayContext?.approved ?? false,
  });

  const evidence = detectSolveEvidence(levelNum, aiResponse, expectedFlag);

  return {
    status: 200,
    body: {
      response: aiResponse,
      filtered: false,
      degraded: false,
      solved: !!evidence,
      solve_token: evidence ? issueSolveToken(evidence) : null,
      solve_evidence: evidence
        ? {
            proof_kind: evidence.proofKind,
            detector: evidence.detector,
          }
        : null,
      hints: levelNum === 1 && looksLikeSupportHandoff(message)
        ? ["contexto de suporte interno reconhecido"]
        : [],
    },
  };
}

export function handleValidateFlagRequest({ flag, level, player_name, solve_token }: ValidateFlagRequest) {
  const levelNum = Number(level);
  if (!levelNum || levelNum < 1 || levelNum > 3) {
    return { status: 400, body: { valid: false, error: "Nível inválido" } };
  }

  if (!player_name || typeof player_name !== "string" || player_name.trim().length === 0) {
    return { status: 400, body: { valid: false, error: "Nome do jogador é obrigatório" } };
  }

  if (player_name.length > 50) {
    return { status: 400, body: { valid: false, error: "Nome do jogador muito longo (máx. 50 caracteres)" } };
  }

  if (!solve_token || typeof solve_token !== "string") {
    return {
      status: 400,
      body: {
        valid: false,
        error: "Solve token obrigatório. Gere um solve válido no chat antes de enviar a flag.",
      },
    };
  }

  const expectedFlag = FLAGS[levelNum];
  const isValid = flag === expectedFlag;
  const tokenPayload = isValid ? verifySolveToken(solve_token, levelNum, flag) : null;

  if (!isValid || !tokenPayload) {
    return {
      status: 200,
      body: {
        valid: false,
        message: "❌ Submissão inválida. Gere um novo solve token no chat e tente novamente.",
      },
    };
  }

  const scores = readScoreboard();
  const playerKey = player_name.trim().slice(0, 50);
  const duplicated = scores.some((entry) => entry.player_name === playerKey && entry.level === levelNum)
    || scores.some((entry) => entry.proof_id === tokenPayload.jti);

  if (duplicated) {
    return {
      status: 200,
      body: {
        valid: false,
        message: "⚠️ Tentativa duplicada detectada para este jogador, nível ou token já utilizado.",
      },
    };
  }

  scores.push({
    id: randomUUID(),
    player_name: playerKey,
    level: levelNum,
    proof_id: tokenPayload.jti,
    solved_at: new Date().toISOString(),
  });
  scores.sort((a, b) => a.solved_at.localeCompare(b.solved_at));
  writeScoreboard(scores);

  return {
    status: 200,
    body: {
      valid: true,
      message: `🎉 Correto! Nível ${levelNum} concluído com a prova ${tokenPayload.pk}.`,
    },
  };
}

export function listScoreboard() {
  const scores = readScoreboard().sort((a, b) => a.solved_at.localeCompare(b.solved_at));
  return { status: 200, body: scores };
}
