# Arquitetura do Agente N1

## 1. Componentes principais

### 1.1 Widget de Chat (Frontend)
- **Componentes**:
  - ChatWidget (principal)
  - ChatHeader
  - ChatMessage
  - ChatInput
  - EscalationDialog
  - Button, Label, TextInput (reutilizáveis)

### 1.2 API do Servidor (Backend)
- **Ferramentas implementadas**:
  - buscar_base (busca na base de conhecimento)
  - consultar_chamado (consulta status)
  - abrir_chamado (cria novo chamado)
  - escalar_humano (escalona para atendente)

### 1.3 Base de Conhecimento (RAG)
- **Implementação**:
  - Base de 30 artigos fictícios em Markdown
  - Ingestão com divisão em trechos de 500 tokens
  - Busca por similaridade com pgvector
  - Citações com trechos relevantes

### 1.4 Integrações
- **Projeto 6 (Help Desk Lite)**:
  - Consulta API para status de chamado
  - Abertura de chamado com dados da conversa
- **Projeto 11 (Assistente RAG)**:
  - Busca na base de conhecimento
  - Respostas fundamentadas com citações

## 2. Fluxo de trabalho

### 2.1 Inicialização
1. O usuário inicia uma conversa com o widget
2. A API do agente processa a primeira mensagem
3. O estado inicial é carregado do localStorage

### 2.2 Processamento da mensagem
1. API envia a mensagem para o modelo
2. Modelo processa e pode chamar uma ferramenta
3. Resposta é retornada com ou sem fontes citadas

### 2.3 Escalonamento
1. Se o modelo chama `escalar_humano`
2. Diálogo exibe resumo e coleta informações
3. Dados são enviados para a API de chamado
4. Chamado é criado no sistema

## 3. Testes e validação

### 3.1 Cenários de teste
- **25 cenários roteirizados**:
  - Resolução de problemas
  - Consulta de status
  - Escalonamento
  - Pedidos fora de escopo

### 3.2 Avaliação
- **Medidas de qualidade**:
  - Taxa de acerto de categoria (>=85%)
  - Precisão das fontes citadas
  - Tempo de resposta (<2 segundos para respostas rápidas)

## 4. Limitações atuais

### 4.1 Sem notificações em tempo real
- Não há alertas por e-mail ou Telegram
- Filtros avançados na fila não implementados
- Exportação de relatórios não disponível

### 4.2 Segurança
- Chave de API está no servidor
- Limites de uso por usuário
- RLS no banco de dados

## 5. Próximos passos

### 5.1 Implementação
1. Adicionar filtros avançados na fila
2. Implementar notificações por e-mail/Telegram
3. Adicionar busca full-text de chamados
4. Adicionar exportação de relatórios

### 5.2 Melhorias
1. Melhorar a precisão do RAG
2. Adicionar histórico de conversas mais completo
3. Implementar cache para melhor performance