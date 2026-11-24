# Widget do Agente N1

O widget usa `POST /chat` do servidor, com JWT do usuário e ID de conversa RAG. O JWT fica apenas na memória da página; o histórico e o ID local da conversa ficam no armazenamento da aba. Não use dados reais na demonstração.

Execute `npm ci`, `npm test`, `npx tsc --noEmit` e `npm run build`. Para desenvolvimento, inicie o servidor na porta 3000 e execute `npm run dev`. O proxy do Vite encaminha `/chat` ao servidor local. Em produção, configure um proxy HTTPS autenticado na mesma origem para encaminhar `/chat` ao servidor. Não exponha o servidor diretamente na internet.

O botão de atendente envia uma solicitação em texto ao agente. A decisão de chamar `escalarHumano` pertence ao modelo; o contrato atual não oferece uma operação direta de escalonamento. As fontes são exibidas no texto retornado pelo servidor. O servidor identifica o resumo de abertura pelo texto e aceita `sim` ou `não` no turno seguinte.
