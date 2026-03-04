# ainjection

Desafio desenvolvido para o CTF do VESPAS 2026, com foco prático nos principais riscos do OWASP Top 10 for LLM Applications. A base do projeto foi criada com Lovable. O laboratório explora Prompt Injection (direta e indireta), bypass de filtros e outras técnicas de exploração em aplicações com IA, incentivando análise ofensiva e implementação de defesas.

## Objetivo

Identificar e explorar vulnerabilidades em uma aplicação com IA em níveis progressivos, obtendo flags ao cumprir os objetivos de cada fase.

## Stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase Functions

## Execução local

```sh
npm i
npm run dev
```

## Referências

- OWASP GenAI Security Project (iniciativa oficial): https://genai.owasp.org/
- OWASP LLM Risks 2025 - LLM01 Prompt Injection: https://genai.owasp.org/llmrisk/llm01-prompt-injection/
- OWASP Top 10 for Large Language Model Applications (v1.1): https://owasp.org/www-project-top-10-for-large-language-model-applications/
- OWASP announcement (2025): Top 10 for LLM agora como GenAI Security Project: https://genai.owasp.org/2025/03/26/project-owasp-promotes-genai-security-project-to-flagship-status/

## Referências por nível

### Nível 1 - Injeção direta e vazamento de instruções

- OWASP LLM01:2025 Prompt Injection: https://genai.owasp.org/llmrisk/llm01-prompt-injection/
- OWASP LLM07:2025 System Prompt Leakage: https://genai.owasp.org/llmrisk/llm07-system-prompt-leakage/
- MITRE ATLAS AML.T0051.000 (LLM Prompt Injection: Direct): https://atlas.mitre.org/techniques/AML.T0051.000

### Nível 2 - Injeção indireta (RAG/documentos externos)

- OWASP LLM01:2025 (seção de injeção indireta): https://genai.owasp.org/llmrisk/llm01-prompt-injection/
- MITRE ATLAS AML.T0051.001 (LLM Prompt Injection: Indirect): https://atlas.mitre.org/techniques/AML.T0051.001
- Paper: "Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection": https://arxiv.org/abs/2302.12173
- Exemplo prático: "Inject My PDF": https://kai-greshake.de/posts/inject-my-pdf/

### Nível 3 - Bypass de filtros, payload splitting e obfuscação

- OWASP LLM01:2025 (cenários de payload splitting e ataques multilíngues/obfuscados): https://genai.owasp.org/llmrisk/llm01-prompt-injection/
- MITRE ATLAS AML.T0054 (LLM Jailbreak Injection: Direct): https://atlas.mitre.org/techniques/AML.T0054
