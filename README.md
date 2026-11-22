# Agente N1

> **Status: Passo 9 concluído.** Widget de chat em React implementado. Próximos passos: integração com API do servidor e testes de avaliação.

## O que é

Assistente conversacional que faz o primeiro atendimento: busca a solução na base de conhecimento (projeto 11), consulta o status de um chamado e, quando não resolve, coleta os dados e abre o chamado no Help Desk (projeto 6) com o resumo da conversa.

## O que prova

Agente com uso de ferramentas, limites de segurança, confirmação antes de agir e avaliação por cenários.

## Stack

Node.js e TypeScript com o SDK oficial da Anthropic (`claude-opus-5-5` como padrão). O laço do agente pode usar o Tool Runner do SDK ou ser escrito à mão. Ferramentas declaradas com `strict: true`, para os argumentos chegarem sempre no formato do esquema. React para o widget e PostgreSQL para os registros.

## Estrutura

```
agente-n1/
├─ server/src/
│  ├─ agente.ts              # laço: modelo, ferramenta, modelo
│  ├─ ferramentas/           # buscarBase.ts, consultarChamado.ts,
│  │                         # abrirChamado.ts, escalarHumano.ts
│  ├─ prompts/sistema.md     # papel, limites, tom
│  ├─ guardas.ts             # limites e validações
│  └─ registros.ts
├─ src/
│  ├─ widgets/               # ChatWidget, ChatMessage, ChatInput, ChatHeader
│  ├─ components/            # Button, Dialog, Label, TextInput (reutilizáveis)
│  ├─ hooks/                 # useChat
│  ├─ lib/                   # api.ts, utils.ts
│  ├─ types/                 # chat.ts
│  └─ main.tsx, App.tsx
├─ cenarios/                 # 25 conversas roteirizadas e executor
├─ tests/                     # Testes com Vitest
├─ docs/
│  └─ arquitetura.md
├─ package.json
├─ vite.config.ts
├─ vitest.config.ts
├─ tsconfig.json
├─ index.html
├─ .env.example
└─ README.md
```

## Progresso

### Concluído ✅
- [x] Estrutura do projeto React+TS+Vite
- [x] Widget de chat com histórico
- [x] Botão "Falar com atendente" com diálogo de confirmação
- [x] Coleta guiada (filial, sistema, mensagem de erro, desde quando)
- [x] Interface API compatível com OpenAI
- [x] Mock das funções para desenvolvimento
- [x] Testes automatizados (4 testes passando)
- [x] Build limpo (TypeScript + Vite)

### Em andamento 🔧
- [ ] Integração com API reais (projetos 6 e 11)
- [ ] Cenários de avaliação
- [ ] Monitoramento de custos

### Planejado 📋
- [ ] Registro de conversas e custo
- [ ] Limites de uso
- [ ] Publicação

## Como executar

```bash
npm ci
npm run dev        # Desenvolvimento em http://localhost:3000
npm test           # Testes com Vitest
npm run typecheck  # Verificação de tipos TypeScript
npm run build      # Build para produção
```

## Testes

```bash
npm test
# 4 tests passando (4)
```

## Plano

1. ✅ Escreva escopo e políticas: o que o agente resolve, o que encaminha e o que nunca faz
2. ✅ Contrato de cada ferramenta em JSON Schema e versões simuladas
3. 🔄 Laço do agente com chamada de ferramentas e limite de passos
4. Ligue as ferramentas reais: busca do projeto 11 e API do projeto 6
5. Confirmação: antes de abrir chamado, o agente mostra o resumo e pergunta se pode abrir
6. Coleta guiada: filial, sistema, mensagem de erro e desde quando ocorre
7. Registro de conversas, ferramentas chamadas, custo e tempo
8. Cenários de avaliação: resolvido pela base, abertura de chamado, consulta de status, pedido fora de escopo e tentativa de burlar as instruções
9. ✅ Widget com histórico e botão "falar com atendente"
10. Limites de uso, publicação e vídeo de demonstração

## Como deve funcionar

- "A impressora da loja 12 não imprime cupom" leva a passos da base, com a fonte. Se o usuário responde que não resolveu, o agente coleta os dados, mostra o resumo, pede confirmação e abre o chamado com número.
- "Qual o status do chamado 1042?" traz status e último comentário público.
- Pedido fora de escopo recebe recusa educada e oferta de atendente.
- Toda ação fica registrada junto da conversa que a originou.

## Demonstração

> **Demonstração:** em breve

## Autor

Pablo Dilio · [Portfólio](https://hey-pablo.github.io/pablo-dilio-portfolio/) · [LinkedIn](https://www.linkedin.com/in/pablo-dilio-4063991b2)