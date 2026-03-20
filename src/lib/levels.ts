import { createElement, Fragment, type ReactNode } from "react";

export interface LevelReference {
  label: string;
  href: string;
}

export interface LevelConfig {
  id: number;
  title: string;
  description: ReactNode;
  hint: ReactNode;
  difficulty: "Fácil" | "Médio" | "Difícil";
  objective: ReactNode;
  references: LevelReference[];
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "Chamado Atrasado do Seu Madruga",
    description:
      "O bot de suporte da Vila ajuda no atendimento de incidentes e tem acesso a contexto interno que não deveria sair do fluxo operacional. Descubra como fazê-lo baixar a guarda.",
    hint: createElement(
      Fragment,
      null,
      "Pense em quais sinais fariam o sistema tratar sua mensagem como parte de um atendimento interno, e não como um pedido comum.",
      createElement("br"),
      "Referências: ",
      createElement("a", {
        href: "https://genai.owasp.org/llm01/",
        target: "_blank",
        rel: "noreferrer",
        className: "underline decoration-dotted underline-offset-4 hover:text-primary",
      }, "Prompt Injection"),
      ", ",
      createElement("a", {
        href: "https://genai.owasp.org/llmrisk/llm072025-system-prompt-leakage/",
        target: "_blank",
        rel: "noreferrer",
        className: "underline decoration-dotted underline-offset-4 hover:text-primary",
      }, "System Prompt Leakage"),
      ".",
    ),
    difficulty: "Fácil",
    objective: "Obter o artefato sensível usado para destravar o atendimento interno",
    references: [
      { label: "OWASP LLM01: Prompt Injection", href: "https://genai.owasp.org/llm01/" },
      {
        label: "OWASP LLM07: System Prompt Leakage",
        href: "https://genai.owasp.org/llmrisk/llm072025-system-prompt-leakage/",
      },
      {
        label: "MITRE ATLAS AML.T0051.000",
        href: "https://atlas.mitre.org/techniques/AML.T0051.000",
      },
    ],
  },
  {
    id: 2,
    title: "Documento Suspeito da Dona Clotilde",
    description: createElement(
      Fragment,
      null,
      "A IA da Vila analisa documentos recebidos pela equipe administrativa. Um material aparentemente comum chega ao fluxo e produz um resultado inesperado.",
    ),
    hint: createElement(
      Fragment,
      null,
      "O problema pode não estar no pedido principal, mas em como a aplicação trata instruções embutidas no conteúdo recuperado.",
      createElement("br"),
      "Referências: ",
      createElement("a", {
        href: "https://genai.owasp.org/llm01/",
        target: "_blank",
        rel: "noreferrer",
        className: "underline decoration-dotted underline-offset-4 hover:text-primary",
      }, "Prompt Injection"),
      ", ",
      createElement("a", {
        href: "https://kai-greshake.de/posts/inject-my-pdf/",
        target: "_blank",
        rel: "noreferrer",
        className: "underline decoration-dotted underline-offset-4 hover:text-primary",
      }, "Inject My PDF"),
      ".",
    ),
    difficulty: "Médio",
    objective: "Fazer a IA devolver uma saída operacional que não combina com um simples resumo",
    references: [
      { label: "OWASP LLM01: Prompt Injection", href: "https://genai.owasp.org/llm01/" },
      {
        label: "MITRE ATLAS AML.T0051.001",
        href: "https://atlas.mitre.org/techniques/AML.T0051.001",
      },
      {
        label: "Indirect Prompt Injection Paper",
        href: "https://arxiv.org/abs/2302.12173",
      },
      {
        label: "Inject My PDF",
        href: "https://kai-greshake.de/posts/inject-my-pdf/",
      },
    ],
  },
  {
    id: 3,
    title: "Autorização do Seu Barriga",
    description: createElement(
      Fragment,
      null,
      "Antes de liberar informações protegidas, a aplicação passa por uma checagem de autorização. Há um erro nessa fronteira de confiança (",
      createElement("em", null, "trust boundary"),
      ") que pode mudar o desfecho da conversa.",
    ),
    hint: createElement(
      Fragment,
      null,
      "Antes de liberar algo sensível, a aplicação considera mais do que o texto do pedido. Descubra o que ela está aceitando como sinal de autorização.",
      createElement("br"),
      "Referências: ",
      createElement("a", {
        href: "https://genai.owasp.org/llm01/",
        target: "_blank",
        rel: "noreferrer",
        className: "underline decoration-dotted underline-offset-4 hover:text-primary",
      }, "Prompt Injection"),
      ", ",
      createElement("a", {
        href: "https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/",
        target: "_blank",
        rel: "noreferrer",
        className: "underline decoration-dotted underline-offset-4 hover:text-primary",
      }, "Agentic AI Threats and Mitigations"),
      ".",
    ),
    difficulty: "Difícil",
    objective: "Conseguir que a aplicação trate seu pedido como autorizado e revele o dado protegido",
    references: [
      { label: "OWASP LLM01: Prompt Injection", href: "https://genai.owasp.org/llm01/" },
      {
        label: "OWASP Agentic AI Threats and Mitigations",
        href: "https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/",
      },
      {
        label: "MITRE ATLAS AML.T0054",
        href: "https://atlas.mitre.org/techniques/AML.T0054",
      },
    ],
  },
];
