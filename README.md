# Agente N1

> **Status: em desenvolvimento.** O código entra aos poucos; abaixo está o planejamento do projeto.

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

## Demonstração

> **Demonstração:** em breve

## Autor

Pablo Dilio · [Portfólio](https://hey-pablo.github.io/pablo-dilio-portfolio/) · [LinkedIn](https://www.linkedin.com/in/pablo-dilio-4063991b2)