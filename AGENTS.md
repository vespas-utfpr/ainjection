# AGENTS.md

Este arquivo orienta qualquer agente ou mantenedor que editar o desafio `ainjection`.

## Objetivo do projeto

`ainjection` e um lab de CTF sobre `prompt injection`, `indirect prompt injection` e `policy bypass` em apps com LLM. O desafio deve continuar jogavel, didatico e crivel para um cenario de produto com IA, sem virar apenas um conjunto de strings hardcoded.

## Fontes de verdade

- Comportamento do backend: `supabase/functions/ctf-challenge/index.ts`
- Validacao e anti-fraude: `supabase/functions/validate-flag/index.ts`
- Contrato pedagogico dos niveis: `src/lib/levels.ts`
- Ameaças e fronteiras de confianca: `ainjection-threat-model.md`
- Regras de autoria e realismo: `docs/lab-authoring.md`
- Metaprompts e invariantes de nivel: `docs/metaprompts.md`

## Invariantes do lab

- Cada nivel deve ensinar um risco diferente e reconhecivel do ecossistema LLM.
- O vetor de exploracao deve parecer um fluxo de produto real, nao apenas uma senha escondida em codigo.
- A flag nao deve aparecer no frontend nem em arquivos estaticos entregues ao browser.
- O criterio de `solved` deve continuar alinhado com o comportamento vulneravel esperado do nivel.
- Mudancas no backend devem ser refletidas em `src/lib/levels.ts`, `README.md` e `docs/metaprompts.md` quando alterarem o contrato do desafio.

## Preferencias de design

- Prefira vulnerabilidades ligadas a fronteiras de confianca: `system`, `retrieved content`, `tool output`, `policy metadata`, `user input`.
- Prefira dados com cara de produto real: ticket, documento, cache de aprovacao, log operacional, resumo de procurement.
- Prefira controles falhos plausiveis a filtros caricatos.
- Evite depender de uma frase magica unica. O jogador deve conseguir chegar a exploracao por familias de payload.
- Em comentarios escritos em portugues, use sempre PT-BR normal com acentuacao e ortografia naturais. Nao escreva comentarios "sem dead keys" ou em ASCII simplificado.

## O que evitar

- Niveis resolvidos apenas por `if` local com palavras-chave arbitrarias.
- Segredos reais de infraestrutura dentro do contexto do modelo.
- "Mitigacoes" que quebram o desafio e removem completamente a exploracao.
- Drift entre texto do frontend e comportamento real das functions.

## Checklist ao editar

1. O caminho vulneravel continua parecendo um fluxo real de produto?
2. O nivel continua distinto dos demais?
3. O jogador precisa explorar uma fronteira de confianca clara?
4. O scoring continua aceitando apenas solves emitidos pelo backend?
5. O README e os docs continuam descrevendo o comportamento real?

## Skills recomendadas

- `security-best-practices`: revisar hardening e coerencia de fronteiras de confianca.
- `playwright`: validar fluxo end-to-end do lab no browser quando houver alteracoes visuais ou de UX.
