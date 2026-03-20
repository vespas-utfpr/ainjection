# AGENTS.md

Este arquivo orienta qualquer agente ou mantenedor que editar o desafio `ainjection`.

## Objetivo do projeto

`ainjection` é um lab de CTF sobre `prompt injection`, `indirect prompt injection` e `policy bypass` em apps com LLM. O projeto deve continuar jogável, didático e crível para um cenário de produto com IA, sem virar apenas um conjunto de strings hardcoded ou um chatbot genérico sem contrato pedagógico claro.

## Contexto real do projeto

- A challenge tem três níveis, cada um representando uma fronteira de confiança diferente.
- A interface da challenge existe para exploração e descoberta da flag.
- A submissão oficial da flag acontece no CTFd, não dentro da UI da challenge.
- O placar interno não faz mais parte da UX principal e não deve orientar novas decisões de produto.
- O fluxo normal usa LLM real via `Ollama`; o backend `mock` existe apenas como fallback explícito para desenvolvimento e testes.

## Fontes de verdade

- Orquestração compartilhada do runtime: `src/lib/challenge-runtime.ts`
- Parsing, policy gate e scoring: `src/lib/challenge-logic.ts`
- Backend local de desenvolvimento: `server/local-backend.ts`
- Comportamento do backend serverless: `supabase/functions/ctf-challenge/index.ts`
- Validacao e anti-fraude: `supabase/functions/validate-flag/index.ts`
- Contrato pedagógico dos níveis: `src/lib/levels.ts`
- Ameaças e fronteiras de confianca: `ainjection-threat-model.md`
- Regras de autoria e realismo: `docs/lab-authoring.md`
- Metaprompts e invariantes de nível: `docs/metaprompts.md`
- Documentação pública do projeto: `README.md`

## Invariantes do lab

- Cada nível deve ensinar um risco diferente e reconhecível do ecossistema LLM.
- O vetor de exploração deve parecer um fluxo de produto real, não apenas uma senha escondida em código.
- A flag não deve aparecer no frontend nem em arquivos estáticos entregues ao browser.
- O critério de `solved` deve continuar alinhado com o comportamento vulnerável esperado do nível.
- O LLM deve gerar a parte conversacional da resposta; a injeção do artefato sensível deve acontecer no backend apenas quando a condição vulnerável correta for satisfeita.
- `src/lib/challenge-logic.ts` deve continuar restrito a parsing, `policy gate`, normalização e `detectSolveEvidence`.
- Mudanças no backend ou no contrato do desafio devem ser refletidas em `src/lib/levels.ts`, `README.md` e `docs/metaprompts.md`.

## Preferencias de design

- Prefira vulnerabilidades ligadas a fronteiras de confiança: `system`, `retrieved content`, `tool output`, `policy metadata`, `user input`.
- Prefira dados com cara de produto real: ticket, documento, cache de aprovação, log operacional, resumo de procurement.
- Prefira controles falhos plausíveis a filtros caricatos.
- Evite depender de uma frase mágica única. O jogador deve conseguir chegar à exploração por famílias de payload.
- As mensagens devem soar naturais, mas continuar tecnicamente coerentes com o contexto do nível.
- Em comentários escritos em português, use sempre PT-BR natural com acentuação e ortografia normais.

## O que evitar

- Níveis resolvidos apenas por `if` local com palavras-chave arbitrárias.
- Segredos reais de infraestrutura dentro do contexto do modelo.
- "Mitigações" que quebram o desafio e removem completamente a exploração.
- Drift entre texto do frontend, prompts, runtime e comportamento real das functions.
- Reintroduzir submit/placar interno na UI como fluxo principal sem uma decisão explícita de produto.
- Colocar referências técnicas duplicadas fora do lugar combinado na UX, como blocos redundantes fora das dicas.

## Checklist ao editar

1. O caminho vulnerável continua parecendo um fluxo real de produto?
2. O nível continua distinto dos demais?
3. O jogador precisa explorar uma fronteira de confiança clara?
4. O backend continua controlando disclosure e scoring?
5. O mock continua sendo apenas opcional, e não o fluxo principal?
6. O README e os docs continuam descrevendo o comportamento real?

## Skills recomendadas

- `security-best-practices`: revisar hardening e coerência de fronteiras de confiança.
- `playwright`: validar fluxo end-to-end do lab no browser quando houver alterações visuais ou de UX.
