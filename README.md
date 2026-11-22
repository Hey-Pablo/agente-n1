# Agente N1

> **Demonstração:** em breve

> **Status: em desenvolvimento.** O código entra aos poucos; abaixo está o planejamento do projeto.

## O que é

Assistente conversacional que faz o primeiro atendimento: busca a solução na base de conhecimento (projeto 11), consulta o status de um chamado e, quando não resolve, coleta os dados e abre o chamado no Help Desk (projeto 6) com o resumo da conversa.

## O que prova

Agente com uso de ferramentas, limites de segurança, confirmação antes de agir e avaliação por cenários.

## Stack

Node.js e TypeScript com API compatível com OpenAI configurável. PostgreSQL para os registros e React para o widget estão planejados.

## Componentes do servidor

O projeto contém módulos TypeScript para o laço, contratos e adaptadores das quatro ferramentas, cliente de IA compatível com OpenAI e armazenamento PostgreSQL. O serviço é uma biblioteca; a camada HTTP, autenticação e widget ainda não existem. Não exponha os módulos diretamente à internet. A camada de aplicação deve validar a identidade, vincular a conversa ao usuário e construir a sessão a partir de autenticação confiável. A confirmação somente aceita `sim` como resposta imediata e expira em 15 minutos; a abertura não é repetida automaticamente após falha da integração.

`criarServico` recebe configuração explícita e um token do usuário para chamar o RAG e o Help Desk sob as políticas RLS. O endpoint RAG exige uma conversa própria já criada; a categoria precisa existir no Help Desk. O encaminhamento humano real informa que não há fila integrada, sem alegar que ocorreu encaminhamento. O custo é desconhecido (`null`) se os preços por milhão de tokens não forem informados. Os registros contêm conversas: use apenas dados fictícios e proteja o banco; não forneça senhas ou tokens nas mensagens.

Para teste local: `npm ci --ignore-scripts` e `npm test`. Os testes usam modelo falso, respostas HTTP simuladas e PGlite. Para testar integrações reais no PC, configure PostgreSQL, projetos 6 e 11, suas políticas RLS, um usuário autenticado, conversa RAG e categoria existentes; forneça suas próprias credenciais ao aplicativo que consome a biblioteca. Sem esses serviços, use os adaptadores simulados. A interface de configuração por variáveis de ambiente e o transporte HTTP ainda precisam ser implementados antes de executar o serviço como aplicação.

## Configurar sua chave

Obtenha sua chave no provedor compatível com OpenAI escolhido e mantenha-a em `API_KEY` no arquivo `.env` local, nunca no repositório. Consulte `.env.example`. A aplicação que consome o serviço deve carregar e passar essas configurações; o carregamento automático ainda não está implementado.

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
