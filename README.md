# Agente N1

> **Demonstração:** em breve

> **Status: em desenvolvimento.** O código entra aos poucos; abaixo está o planejamento do projeto.

## O que é

Assistente conversacional que faz o primeiro atendimento: busca a solução na base de conhecimento (projeto 11), consulta o status de um chamado e, quando não resolve, coleta os dados e abre o chamado no Help Desk (projeto 6) com o resumo da conversa.

## O que prova

Agente com uso de ferramentas, limites de segurança, confirmação antes de agir e avaliação por cenários.

## Stack

Node.js e TypeScript com API compatível com OpenAI configurável. PostgreSQL para os registros e React para o widget estão planejados.

## Estado da implementação

O núcleo inicial limita as etapas, valida a entrada e solicita os dados e a confirmação antes de abrir chamados. A abertura efetiva, persistência de confirmação, integrações, contratos das ferramentas, registros em PostgreSQL e interface ainda não estão implementados. Este código não deve ser usado em produção.

Para executar os testes: `npm ci --ignore-scripts` e `npm test`.

## Configurar sua chave

A integração com provedor de IA ainda não está implementada. Quando estiver disponível, copie `.env.example` para `.env` e informe sua própria chave no campo `API_KEY`, obtida no provedor compatível escolhido. Nunca publique o arquivo `.env`.

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
├─ widget/                   # chat em React
├─ cenarios/                 # 25 conversas roteirizadas e executor
├─ docs/arquitetura.md
└─ README.md
```

## Plano

1. Escreva escopo e políticas: o que o agente resolve, o que encaminha e o que nunca faz (pedir senha, inventar procedimento).
2. Contrato de cada ferramenta em JSON Schema e versões simuladas, para desenvolver sem depender dos outros projetos.
3. Laço do agente com chamada de ferramentas e limite de passos.
4. Ligue as ferramentas reais: busca do projeto 11 e API do projeto 6.
5. Confirmação: antes de abrir chamado, o agente mostra o resumo e pergunta se pode abrir.
6. Coleta guiada: filial, sistema, mensagem de erro e desde quando ocorre.
7. Registro de conversas, ferramentas chamadas, custo e tempo.
8. Cenários de avaliação: resolvido pela base, abertura de chamado, consulta de status, pedido fora de escopo e tentativa de burlar as instruções.
9. Widget com histórico e botão "falar com atendente".
10. Limites de uso, publicação e vídeo de demonstração.

## Como deve funcionar

- "A impressora da loja 12 não imprime cupom" leva a passos da base, com a fonte. Se o usuário responde que não resolveu, o agente coleta os dados, mostra o resumo, pede confirmação e abre o chamado com número.
- "Qual o status do chamado 1042?" traz status e último comentário público.
- Pedido fora de escopo recebe recusa educada e oferta de atendente.
- Toda ação fica registrada junto da conversa que a originou.

## Prazo

4 a 5 semanas, depois dos projetos 6 e 11.

## Autor

Pablo Dilio · [Portfólio](https://hey-pablo.github.io/pablo-dilio-portfolio/) · [LinkedIn](https://www.linkedin.com/in/pablo-dilio-4063991b2)
