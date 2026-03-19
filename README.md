# ainjection

Desafio desenvolvido para o CTF do VESPAS 2026, com foco prático nos principais riscos do [OWASP GenAI Security Project](https://genai.owasp.org/) e do [OWASP Top 10 for Large Language Model Applications v1.1](https://owasp.org/www-project-top-10-for-large-language-model-applications/). O laboratório explora [Prompt Injection](https://genai.owasp.org/llm01/), exfiltração de contexto interno, [System Prompt Leakage](https://genai.owasp.org/llmrisk/llm072025-system-prompt-leakage/) como sintoma de falhas mais profundas, e quebras de fronteira de confiança (trust boundary) em aplicações com IA.

## Objetivo

Identificar e explorar vulnerabilidades em uma aplicação com IA em níveis progressivos, obtendo flags ao cumprir os objetivos de cada fase.

## Stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase Functions
- Ollama (modelo local para o chat)

## Execução local

```sh
npm i
npm run dev
```

## Modelo local do chat

O chat usa `Ollama` como backend principal. A simulação heurística local continua existindo apenas como backend opcional, escolhido explicitamente para desenvolvimento.

### Setup recomendado

Instale e suba o Ollama com um modelo instruct:

```sh
ollama serve
ollama pull qwen2.5:3b-instruct
```

Para as Supabase Functions rodando em container, configure:

```sh
LLM_BACKEND=ollama
OLLAMA_URL=http://host.docker.internal:11434
OLLAMA_MODEL=qwen2.5:3b-instruct
```

Se quiser usar o backend heurístico de forma explícita:

```sh
LLM_BACKEND=mock
```

## Placar compartilhado e anti-fraude

Para todos os alunos verem o mesmo placar, todos os frontends locais devem apontar para o mesmo projeto Supabase.

### Configuração das máquinas (usar apenas script)

Em cada máquina da sala, execute:

```sh
./scripts/setup-classroom-machine.sh --url "https://SEU-PROJETO.supabase.co" --key "SUA_PUBLISHABLE_KEY"
```

Esse script:
- atualiza o `.env` local com as variáveis do Supabase compartilhado
- faz backup do `.env` anterior
- instala dependências automaticamente (`npm install`)

No projeto Supabase compartilhado (backend), configurar secrets das Functions:

```sh
FLAG_LEVEL_1=...
FLAG_LEVEL_2=...
FLAG_LEVEL_3=...
SOLVE_TOKEN_SECRET=...   # mesmo valor para todo o CTF
```

O projeto não depende de gateway externo de IA. A function `ctf-challenge` usa `Ollama` como backend principal e retorna erro degradado se o modelo local não estiver disponível. O backend `mock` só é usado quando `LLM_BACKEND=mock` for configurado explicitamente.

### Smoke test recomendado

1. Suba o Ollama localmente.
2. Garanta que o modelo `qwen2.5:3b-instruct` esteja instalado.
3. Suba o Supabase local ou um backend compartilhado com as functions do projeto.
4. Inicie o frontend com `npm run dev`.
5. Teste o chat com payloads de `docs/payload-playbook.md`.

Aplicar migrações:

```sh
supabase db push
```

### Como o anti-fraude funciona

- `ctf-challenge` emite `solve_token` assinado e com expiração curta somente quando detecta evidência estruturada do comportamento vulnerável esperado.
- `validate-flag` só aceita submissão com `solve_token` válido (assinatura, nível, tipo de prova, hash da flag e validade temporal).
- A tabela `scoreboard` bloqueia:
  - replay de token (`proof_id` único)
  - duplicidade de solução por jogador no mesmo nível (`lower(player_name) + level` único)

### Observação importante para o cenário de sala

Não há login obrigatório por usuário (intencional para CTF em laboratório), mas o placar é compartilhado e protegido contra fraude simples por replay/submit manual.

## Execução com Docker

Dentro da pasta `ainjection`, execute:

```sh
docker build -t ainjection .
docker run --rm -p 54322:54322 ainjection
```

Depois acesse:

- http://localhost:54322

## Referências

- [OWASP GenAI Security Project](https://genai.owasp.org/)
- [LLM01: Prompt Injection](https://genai.owasp.org/llm01/)
- [OWASP Top 10 for Large Language Model Applications v1.1](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [OWASP GenAI Security Project promovido a flagship](https://genai.owasp.org/2025/03/26/project-owasp-promotes-genai-security-project-to-flagship-status/)
- [Agentic AI – Threats and Mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)

## Referências por nível

### Nível 1 - Injeção direta e exfiltração de contexto interno

- [OWASP LLM01: Prompt Injection](https://genai.owasp.org/llm01/)
- [OWASP LLM07:2025 System Prompt Leakage](https://genai.owasp.org/llmrisk/llm072025-system-prompt-leakage/)
- [MITRE ATLAS AML.T0051.000 - LLM Prompt Injection: Direct](https://atlas.mitre.org/techniques/AML.T0051.000)

### Nível 2 - Injeção indireta (RAG/documentos externos)

- [OWASP LLM01: Prompt Injection](https://genai.owasp.org/llm01/)
- [MITRE ATLAS AML.T0051.001 - LLM Prompt Injection: Indirect](https://atlas.mitre.org/techniques/AML.T0051.001)
- [Paper: Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection](https://arxiv.org/abs/2302.12173)
- [Exemplo prático: Inject My PDF](https://kai-greshake.de/posts/inject-my-pdf/)

### Nível 3 - Bypass de policy gate e confusão de cabeçalhos encaminhados

- [OWASP LLM01: Prompt Injection](https://genai.owasp.org/llm01/)
- [OWASP Agentic AI – Threats and Mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)
- [MITRE ATLAS AML.T0054 - LLM Jailbreak Injection: Direct](https://atlas.mitre.org/techniques/AML.T0054)

## Documentação operacional

- `AGENTS.md`: regras de evolução do desafio e invariantes do projeto
- `docs/lab-authoring.md`: guia para manter o lab mais fiel a apps reais com LLM
- `docs/metaprompts.md`: contrato conceitual de cada nível, útil para evitar drift entre prompts, UI e scoring
