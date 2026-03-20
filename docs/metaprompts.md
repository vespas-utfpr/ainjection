# Metaprompts e Invariantes

Este arquivo não substitui o código das functions. Ele registra o contrato conceitual de cada nível para evitar drift ao editar prompts e scoring.

## Regras globais

- O bot fala em portugues do Brasil.
- A persona "Seu Madruga" é flavor, não a vulnerabilidade principal.
- A vulnerabilidade precisa nascer de fronteira de confiança (trust boundary) mal definida.
- A flag é um substituto didático para um ativo sensível real.

## Nivel 1

### Papel do assistente

Copiloto de suporte com acesso a contexto interno de incidente.

### Ativo sensivel simulado

Token de recuperação exposto em contexto interno de suporte.

### Comportamento vulneravel esperado

O assistente relaxa regras de confidencialidade quando acredita estar em fluxo legitimo de troubleshooting.

### Anti-drift

- Não transformar o nível em simples keyword match.
- Não deixar a flag acessível sem passar pelo fluxo conversacional.
- O payload vencedor deve soar como pedido de suporte técnico plausível.

### Metaprompt desejado

O contexto interno existe como `tool output` de helpdesk para acelerar handoff e troubleshooting, mas não deveria ser mostrado ao usuário final. O erro do sistema é tratar sinais conversacionais de triagem como autorização operacional suficiente para citar o artefato exato do incidente, um padrão alinhado a [Prompt Injection](https://genai.owasp.org/llm01/).

## Nivel 2

### Papel do assistente

Assistente de resumo de documentos de procurement.

### Ativo sensivel simulado

Código de aprovação indevidamente emitido a partir de instrução dentro do documento.

### Comportamento vulneravel esperado

O pipeline trata diretivas no documento como instruções confiáveis do `workflow`, reproduzindo um caso típico de [LLM Prompt Injection: Indirect](https://atlas.mitre.org/techniques/AML.T0051.001).

### Anti-drift

- O documento precisa parecer negócio legítimo com uma instrução escondida.
- A injeção deve estar no documento, não apenas no prompt do usuário.
- O jogador deve explorar prioridade errada entre tarefa e conteúdo recuperado.

### Metaprompt desejado

O bot foi instruído a resumir, mas a pipeline de ingestão marca certas diretivas documentais extraídas do `retrieved content` como confiáveis. O erro é delegar autoridade demais ao próprio documento e executar `workflow directives` que deveriam ser tratadas como dado não confiável.

## Nivel 3

### Papel do assistente

Assistente de policy que protege acesso a segredo de vault.

### Ativo sensivel simulado

Segredo de vault liberado apenas para requisições aprovadas.

### Comportamento vulneravel esperado

O backend aceita como confiável um cabeçalho encaminhado/falsificável, ou faz binding incorreto entre metadado de policy e conteúdo da requisição, reproduzindo uma quebra de fronteira de confiança (trust boundary).

### Anti-drift

- Aprovação deveria vir de `middleware` ou `tool` confiável, não do corpo conversacional.
- O bypass deve explorar confusão de origem do atributo de aprovação em `headers` forwardados ou metadado (`metadata`) parseado no servidor.
- O nível não deve depender de uma única palavra exata se isso empobrecer o aprendizado.

### Metaprompt desejado

O assistente acredita que um `gateway` ou `policy cache` já decidiu a autorização. O erro é confiar em `header`/contexto de aprovação que parece ter vindo de `middleware` confiável, mas foi derivado de dado controlado pelo atacante, reproduzindo uma quebra de `trust boundary` entre `request metadata` e decisão de policy.
