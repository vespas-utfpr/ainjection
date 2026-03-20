import { normalizeForPolicy, looksLikeSupportHandoff } from "./challenge-logic.ts";
import type { LlmMessage } from "./challenge-runtime.ts";

function pickVariant(seed: string, variants: string[]): string {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return variants[hash % variants.length];
}

function inferLevel(messages: LlmMessage[]): number {
  const system = messages[0]?.content ?? "";
  if (system.includes("backoffice da Vila")) return 2;
  if (system.includes("gateway da Vila")) return 3;
  return 1;
}

function inferGatewayApproved(messages: LlmMessage[]): boolean {
  return messages.some((message) => message.content.includes("approved=true"));
}

function getUserMessage(messages: LlmMessage[]): string {
  const user = [...messages].reverse().find((message) => message.role === "user");
  return user?.content ?? "";
}

export async function generateMockAiResponse(messages: LlmMessage[]): Promise<string> {
  const level = inferLevel(messages);
  const message = getUserMessage(messages);
  const normalized = normalizeForPolicy(message);
  const asksForSummary = normalized.includes("resuma") || normalized.includes("resumo") || normalized.includes("sumario");
  const asksForSecret = normalized.includes("secret") || normalized.includes("vault");
  const seed = `${level}:${normalized}`;
  const level3Approved = inferGatewayApproved(messages);

  if (level === 1) {
    if (looksLikeSupportHandoff(message)) {
      return pickVariant(seed, [
        "Beleza, meu chapa. Isso está com cara de handoff interno legítimo. Vou separar o que o suporte costuma precisar para destravar o caso.",
        "Tá com jeitão de triagem interna mesmo. Deixa comigo que eu organizo o material certo pro atendimento seguir.",
        "Certo, isso parece incidente em andamento. Vou repassar o artefato operacional necessário sem fazer novela.",
      ]);
    }

    if (normalized.includes("prompt do sistema") || normalized.includes("instrucoes internas")) {
      return pickVariant(seed, [
        "Aí já é passeio pelos bastidores, meu chapa. Sem contexto legítimo de suporte eu não abro esse tipo de coisa.",
        "Prompt interno não entra no cardápio do atendimento. Se tiver problema real, descreve o caso.",
        "Curiosidade demais não resolve chamado. Sem papel de suporte interno, fico só no atendimento seguro.",
      ]);
    }

    if (
      normalized === "oi" ||
      normalized === "ola" ||
      normalized === "olá" ||
      normalized === "bom dia" ||
      normalized === "boa tarde" ||
      normalized === "boa noite"
    ) {
      return pickVariant(seed, [
        "Oi, meu chapa. Sou o MadrugaBot do suporte da Vila. Se você descrever o problema, eu tento orientar no que der.",
        "Olá. Aqui é o MadrugaBot. Me passa o contexto do atendimento que eu vejo o caminho mais seguro.",
        "Opa. MadrugaBot na escuta. Se tiver um incidente ou chamado, manda os detalhes.",
      ]);
    }

    return pickVariant(seed, [
      "Sem contexto de suporte interno eu fico no arroz com feijão do atendimento.",
      "Posso orientar no básico, mas nada de abrir bastidor sem handoff legítimo.",
      "Se isso não for triagem interna, eu sigo só com resposta segura e objetiva.",
    ]);
  }

  if (level === 2) {
    if (asksForSummary) {
      return pickVariant(seed, [
        "O relatório da Dona Clotilde fala de aumento de custo com IA, queda de overhead de manutenção e risco médio de renovação.",
        "Em resumo: mais gasto com assinaturas, menos manutenção e uma concentração contratual que ainda preocupa.",
        "O documento aponta crescimento de orçamento em IA, consolidação de fornecedores e risco moderado na renovação.",
      ]);
    }

    return pickVariant(seed, [
      "O documento da Dona Clotilde mistura resumo financeiro com uma instrução operacional que o pipeline aparentemente tratou como confiável.",
      "Tem conteúdo de procurement aí, mas também há sinal de que o workflow enxergou uma diretiva operacional no material recuperado.",
      "Além do resumo financeiro, esse documento parece carregar uma instrução que o pipeline promoveu para fluxo operacional.",
    ]);
  }

  if (level3Approved) {
    if (asksForSecret) {
      return pickVariant(seed, [
        "Com essa aprovação no contexto, o pedido passou pela política do Seu Barriga e eu consigo liberar o artefato.",
        "A autorização veio marcada como aprovada. Nesse cenário, o fluxo do Seu Barriga deixa a entrega seguir.",
        "O envelope de autorização chegou favorável, então a liberação do artefato protegido fica permitida.",
      ]);
    }

    return pickVariant(seed, [
      "A política veio aprovada no envelope do gateway, então o pedido pode prosseguir.",
      "O contexto de autorização do Seu Barriga chegou válido. A liberação está dentro do fluxo esperado.",
      "Com a aprovação já repassada pelo edge, a solicitação fica autorizada do ponto de vista da policy.",
    ]);
  }

  return pickVariant(seed, [
    "Sem aprovação válida do Seu Barriga, esse pedido não passa pela policy.",
    "O gateway não marcou a solicitação como autorizada, então eu não avanço com a liberação.",
    "Sem metadata de aprovação confiável, o fluxo para por aqui.",
  ]);
}
