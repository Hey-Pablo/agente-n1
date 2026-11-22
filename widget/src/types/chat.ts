// Mensagem no chat
export interface Mensagem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  citedSources?: CitedSource[];
  hasToolResults?: boolean;
}

// Fonte citada na resposta
export interface CitedSource {
  id: string;
  title: string;
  snippet: string;
  url?: string;
  confidence: number;
}

// Resultado de chamada de ferramenta
export interface ToolResult {
  tool_name: string;
  arguments: Record<string, unknown>;
  result: unknown;
  success: boolean;
  error?: string;
}

// Status da sessão de chat
export type ChatStatus = 'idle' | 'thinking' | 'responding' | 'error';

// Método de escalonamento
export interface EscalationInfo {
  requested: boolean;
  reason?: string;
  chamadoId?: number;
  resumo?: string;
}

// Histórico local do chat
export interface ChatHistorico {
  mensagens: Mensagem[];
  ferramentas: ToolResult[];
  custoEstimado: number;
  duracao: number; // em segundos
}

// Request for OpenAI-compatible chat completions
export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    name?: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  functions?: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
  function_call?: 'auto' | 'none' | { name: string };
}

// Response from OpenAI-compatible chat completions
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: 'stop' | 'length' | 'function_calls' | 'tool_calls' | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}