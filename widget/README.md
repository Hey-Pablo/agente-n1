# Agente N1 - Widget de Chat

> **Status: Implementado e pronto para revisão**

Widget de chat em React com histórico e botão "Falar com atendente".

## O que foi entregue

### Componentes React implementados:
- **ChatWidget.tsx** - Componente principal com histórico de mensagens (localStorage)
- **ChatMessage.tsx** - Exibe mensagens com fontes citadas e renderização markdown
- **ChatInput.tsx** - Textarea com contador de caracteres e botão enviar
- **ChatHeader.tsx** - Cabeçalho com título e botão "Falar com atendente"
- **EscalationDialog.tsx** - Diálogo para coletar filial, sistema, mensagemErro, desdeQuando

### Infraestrutura:
- **api.ts** - Cliente API compatível OpenAI (VITE_AGENT_API_BASE_URL, VITE_AGENT_API_KEY, VITE_AGENT_MODEL)
- **chat.ts** - Interfaces TypeScript (Mensagem, CitedSource, ToolResult, ChatStatus, EscalationInfo)

### Testes e Build:
- 4 testes automatizados passando (Vitest + Testing Library + happy-dom)
- TypeScript strict mode sem erros
- Build de produção limpo

## Como executar

```bash
cd widget
npm ci
npm run dev        # Desenvolvimento em http://localhost:3001
npm test           # Testes com Vitest
npm run typecheck  # Verificação de tipos TypeScript
npm run build      # Build para produção
```

## Variáveis de ambiente

Criar arquivo `.env` na raiz do projeto:

```bash
VITE_AGENT_API_BASE_URL=https://api.seuservico.com
VITE_AGENT_API_KEY=sua-api-key
VITE_AGENT_MODEL=gpt-3.5-turbo
```

## Funcionalidades

- ✅ Chat com histórico local (salvo no localStorage)
- ✅ Botão "Falar com atendente" com diálogo de confirmação
- ✅ Coleta guiada (filial, sistema, mensagem de erro, desde quando)
- ✅ Interface API compatível com OpenAI
- ✅ Mock das funções para desenvolvimento
- ✅ Testes automatizados
- ✅ Build limpo (TypeScript + Vite)

## PR

- URL: https://github.com/Hey-Pablo/agente-n1/pull/2
- Branch: `feat/widget-chat-react`

## Próximos passos

1. Integração com APIs reais dos projetos 6 (Help Desk Lite) e 11 (Assistente RAG)
2. Cenários de avaliação
3. Publicação no GitHub Pages
