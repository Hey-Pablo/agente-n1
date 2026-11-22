# Agente N1

> **Demonstração:** em breve

> **Status: em desenvolvimento.** O código entra aos poucos; abaixo está o planejamento do projeto.

## O que é

Assistente conversacional que faz o primeiro atendimento: busca a solução na base de conhecimento (projeto 11), consulta o status de um chamado e, quando não resolve, coleta os dados e abre o chamado no Help Desk (projeto 6) com o resumo da conversa.

## O que prova

Agente com uso de ferramentas, limites de segurança, confirmação antes de agir e avaliação por cenários.

## Stack

Node.js e TypeScript com API compatível com OpenAI configurável. PostgreSQL para os registros e React para o widget estão planejados.

## Executar o servidor

Requisitos: Node.js 20 ou superior, PostgreSQL e projetos RAG e Help Desk configurados. Instale com `npm ci --ignore-scripts`, copie `.env.example` para `.env` e configure as variáveis. Carregue o arquivo no ambiente antes de executar `npm run build` e `npm start` (por exemplo, `node --env-file=.env dist/main.js`). O servidor escuta somente em `127.0.0.1:3000`, ou na porta de `PORT`. Use um proxy HTTPS autenticado para acesso remoto.

`BASE_URL`, `API_KEY` e `MODEL` configuram um provedor compatível com OpenAI; obtenha sua própria chave no provedor e mantenha-a fora do Git. `DATABASE_URL` aponta ao PostgreSQL; `RAG_URL` e `HELPDESK_URL` apontam aos serviços; as chaves públicas `RAG_ANON_KEY` e `HELPDESK_ANON_KEY`, `AUTH_URL` e `CATEGORIA_ID` devem corresponder aos projetos. O JWT apresentado precisa ser aceito pelo serviço de autenticação e pelas políticas RLS dos dois projetos. Crie a conversa RAG e a categoria antes do teste. `FERRAMENTAS_SIMULADAS=true` simula busca e chamados; a autenticação e o banco continuam necessários.

Envie `POST /chat` com `Authorization: Bearer <JWT>` e JSON contendo `mensagem`, `conversaId` e `ragConversaId`. O servidor verifica o JWT e associa o identificador da conversa ao usuário autenticado. Antes de abrir chamado, solicita os campos ausentes e exige resposta imediata `sim` ao resumo; a confirmação expira após 15 minutos. O escalonamento registra item pendente na tabela `escalonamentos`; a equipe deve consultar e atender essa fila pelo banco, pois ainda não há painel de atendimento ou notificação automática. Registros contêm conversas: use dados fictícios, proteja o banco e não envie senhas ou tokens em mensagens.

## Testes e configuração da chave

Execute `npm test`. Os testes usam modelo falso, HTTP simulado e PGlite. `npm audit --omit=dev` verifica as dependências de produção. Para testar integrações reais no PC, configure PostgreSQL e os projetos 6 e 11, crie usuário, conversa RAG e categoria fictícios e verifique RLS, busca, status, comentário público e abertura confirmada. Nenhuma credencial real é necessária nos testes automatizados.

Obtenha a chave de IA no provedor escolhido e coloque-a em `API_KEY` no `.env` local. Nunca publique esse arquivo. Veja os nomes e valores fictícios em `.env.example`.

## Avaliação por cenários

Após `npm ci --ignore-scripts` e `npm run build`, execute `node cenarios/executor.mjs --saida=relatorio-local.json`. O arquivo contém 25 conversas fictícias em cinco categorias. O modelo falso segue um roteiro determinístico; o resultado valida o executor e os guardas, não mede a qualidade de uma IA. Cada turno verifica trecho da resposta, ferramenta esperada quando aplicável e número de chamados abertos. Leia as respostas: essas verificações automáticas não garantem segurança ou correção semântica.

Para avaliar um modelo real opcionalmente, configure `BASE_URL`, `API_KEY` e `MODEL` no ambiente e execute `node cenarios/executor.mjs --real --saida=relatorio-local.json`. O padrão de `BASE_URL` é FreeLLMAPI; obtenha sua própria chave no provedor escolhido e mantenha-a apenas no ambiente ou `.env` local. A execução usa ferramentas simuladas, pode consumir sua cota e registra modelo configurado, data UTC, entradas e respostas. Não houve avaliação real incluída neste repositório. Revise resultados e remova qualquer dado sensível antes de compartilhar o relatório. Veja [arquitetura](docs/arquitetura.md).

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
