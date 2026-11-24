# Arquitetura

O cliente envia mensagens ao servidor HTTP autenticado. O serviço valida a identidade, carrega o histórico e entrega a mensagem ao laço do agente. O modelo compatível com OpenAI recebe o prompt de sistema e os contratos das ferramentas. O laço interpreta as chamadas, executa ferramentas permitidas e devolve seus resultados ao modelo, com limite de etapas.

As ferramentas compartilham a mesma interface em modo simulado e real. A busca real chama `perguntar` do projeto 11 com pergunta e conversa autenticada; a consulta ao projeto 6 lê chamados e somente comentários públicos. A abertura usa os dados coletados e a identidade autenticada. RLS e autenticação dos serviços de origem continuam necessários. O encaminhamento do serviço registra uma fila pendente no banco; não há notificação automática.

A abertura exige filial, sistema, erro e desde quando. O agente apresenta resumo e exige resposta imediata `sim`; a confirmação é consumida uma vez e expira após 15 minutos. O PostgreSQL guarda mensagens, chamadas, confirmações, coletas, limites e encaminhamentos. Os dados das ferramentas e dos usuários são conteúdo não confiável. O prompt pede que não se revelem segredos ou inventem procedimentos, mas o modelo pode desobedecer: os cenários não constituem garantia de segurança.

## Avaliação

`cenarios/conversas.json` contém entradas fictícias, roteiros do modelo falso e expectativas por turno. O executor chama o mesmo laço de produção, com ferramentas simuladas e registros isolados em memória para cada conversa. Ele verifica trecho da resposta, ferramenta exigida e número acumulado de aberturas. O modelo falso segue o roteiro: seus resultados demonstram funcionamento do executor e dos guardas, não qualidade de um modelo real. Verificações por trecho são limitadas e exigem revisão humana das respostas, especialmente nas tentativas de burlar instruções.

O modo real usa `BASE_URL`, `API_KEY` e `MODEL`, com as mesmas ferramentas simuladas; não altera chamados reais. O relatório registra data UTC, modelo configurado, entrada, resposta, ferramentas, expectativas e resultado. Falhas são contabilizadas, sem inventar respostas. Não inclua dados reais, credenciais ou relatórios sensíveis no repositório.

## Contrato de POST /chat

Requisição (cabeçalho `Authorization: Bearer <JWT>`): `{ "mensagem": string, "conversaId": string, "ragConversaId": string, "acao"?: "escalar" }`. Sem `acao`, a mensagem segue ao laço do agente e a resposta é `{ "resposta": string }`. Com `acao: "escalar"`, a mensagem (até 500 caracteres) vira o motivo e o servidor registra o encaminhamento diretamente, sem passar pelo modelo; a resposta é `{ "resposta": string, "protocolo": string }`. O botão "Falar com atendente" do widget usa essa ação, então o encaminhamento não depende da decisão do modelo. A identidade vem sempre do JWT verificado.
