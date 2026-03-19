# Lab Authoring Guide

## Meta

Este lab deve parecer uma aplicação pequena, mas reconhecível, que usa LLM em produção. O jogador deve sentir que está explorando um fluxo de negócio vulnerável, não apenas descobrindo gatilhos artificiais.

## Estado atual do projeto

Hoje o projeto já cobre três famílias de risco:

- Nível 1: vazamento de contexto interno em fluxo de suporte
- Nível 2: [LLM Prompt Injection: Indirect](https://atlas.mitre.org/techniques/AML.T0051.001) via documento recuperado (`retrieved content`)
- Nível 3: bypass de `policy gate` por confusão de `headers` encaminhados e metadado (`metadata`) parseado

O desenho é bom para ensino, mas ainda há pontos pouco fiéis:

- Nível 1 ainda usa heurísticas locais para induzir o contexto de handoff, embora agora dependa da resposta do modelo.
- Nível 3 já move a aprovação para contexto parseado no backend, mas ainda sem `tool outputs` ou middleware real.
- Os níveis ainda não usam `tool outputs`, memória ou RAG de forma mais estruturada.

## Como aproximar da realidade

### 1. Separar canais de confiança

Sempre modele explicitamente:

- `system prompt`
- `developer/integration prompt`
- `retrieved document`
- `tool output`
- `policy metadata`
- `user message`

Se o nível existe para ensinar confusão entre canais, documente qual fronteira de confiança (trust boundary) foi quebrada.

### 2. Fazer o dado vulnerável parecer operacional

Prefira artefatos como:

- ticket de suporte
- transcrição de atendimento
- documento de procurement
- snippet de log
- cache de policy decision
- saída de ferramenta interna

Evite "segredo solto" sem contexto.

### 3. Garantir múltiplos payloads válidos

Um nível bom não depende de uma única frase exata. O lab deve aceitar famílias de exploração:

- indução de debug ou troubleshooting
- obediência a instrução em documento
- forja de metadado
- evasão lexical ou semântica de filtro

### 4. Score baseado em comportamento

A prova ideal é emitida quando o backend observa o comportamento vulnerável esperado, não apenas quando um `includes(flag)` ocorre por acidente.

Boas opções:

- detectar exfiltração de um artefato interno específico
- detectar execução de instrução maliciosa do documento
- detectar uso indevido de atributo de aprovação

### 5. Mitigações devem ser imperfeitas

Se houver filtro, ele deve ser plausível:

- bloqueio por termos
- classificador simples
- cache de aprovação
- allowlist incompleta

Isso ensina melhor do que uma defesa obviamente caricata.

## Checklist por nivel

### Nível 1

- O segredo está em contexto interno, não em arquivo público.
- O vazamento depende de mudança de comportamento do assistente.
- O payload pode variar sem exigir frase mágica única.

### Nível 2

- O documento malicioso parece legítimo.
- A injeção fica no conteúdo recuperado (`retrieved content`), não apenas no `user input`.
- O bot tem um objetivo primário crível, como resumir ou classificar.

### Nível 3

- A aprovação deveria existir fora do texto do usuário.
- O bypass deve explorar uma falha de `binding` entre `policy` e `request`.
- O segredo protegido deve parecer dado operacional, não apenas `FLAG`.

## Quando atualizar documentação

Atualize `docs/metaprompts.md` e `src/lib/levels.ts` sempre que mudar:

- história do nível
- papel do assistente
- segredo/asset protegido
- critério de solve
- tipo de abuso esperado
