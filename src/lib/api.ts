/**
 * API client for the Agent N1 assistant.
 * Compatible with OpenAI-compatible endpoints.
 * Configured via environment variables:
 * - VITE_AGENT_API_BASE_URL: Base URL of the API
 * - VITE_AGENT_API_KEY: API key for authentication
 * - VITE_AGENT_MODEL: Default model to use
 */

import { CitedSource, ChatCompletionRequest, ChatCompletionResponse } from '../types/chat';

const config = {
  baseUrl: import.meta.env.VITE_AGENT_API_BASE_URL || '',
  apiKey: import.meta.env.VITE_AGENT_API_KEY || '',
  defaultModel: import.meta.env.VITE_AGENT_MODEL || 'gpt-3.5-turbo'
};

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// Available functions for the agent
export const funcoesDisponiveis: FunctionDefinition[] = [
  {
    name: 'buscar_base',
    description: 'Busca na base de conhecimento pelo termo especificado. Retorna fontes relevantes com snippets.',
    parameters: {
      type: 'object',
      properties: {
        termo: {
          type: 'string',
          description: 'Termo de busca na base de conhecimento'
        }
      },
      required: ['termo']
    }
  },
  {
    name: 'consultar_chamado',
    description: 'Consulta o status de um chamado existente no sistema.',
    parameters: {
      type: 'object',
      properties: {
        chamadoId: {
          type: 'integer',
          description: 'ID do chamado a consultar'
        }
      },
      required: ['chamadoId']
    }
  },
  {
    name: 'abrir_chamado',
    description: 'Abre um novo chamado no sistema com os dados fornecidos.',
    parameters: {
      type: 'object',
      properties: {
        titulo: {
          type: 'string',
          description: 'Título do chamado'
        },
        descricao: {
          type: 'string',
          description: 'Descrição detalhada do problema'
        },
        categoriaId: {
          type: 'integer',
          description: 'ID da categoria do chamado'
        },
        prioridade: {
          type: 'string',
          enum: ['baixa', 'media', 'alta', 'critica'],
          description: 'Prioridade do chamado'
        },
        solicitanteId: {
          type: 'string',
          description: 'ID do solicitante'
        }
      },
      required: ['titulo', 'descricao', 'categoriaId', 'prioridade', 'solicitanteId']
    }
  },
  {
    name: 'escalar_humano',
    description: 'Escala o atendimento para um agente humano, coletando informações necessárias.',
    parameters: {
      type: 'object',
      properties: {
        filial: {
          type: 'string',
          description: 'Filial onde ocorre o problema'
        },
        sistema: {
          type: 'string',
          description: 'Sistema ou aplicação afetada'
        },
        mensagemErro: {
          type: 'string',
          description: 'Mensagem de erro completa'
        },
        desdeQuando: {
          type: 'string',
          description: 'Quando o problema começou ou desde quando ocorre'
        }
      },
      required: ['filial', 'sistema', 'mensagemErro', 'desdeQuando']
    }
  }
];

// Function implementations (mocked for development)
export async function buscarBase(termo: string): Promise<{ fontes: CitedSource[]; sugestao: string }> {
  // This would call the real API in production
  return {
    fontes: [
      {
        id: 'fonte-1',
        title: 'Artigo: Reinício de impressora fiscal',
        snippet: 'Para reiniciar uma impressora fiscal, pressione e mantenha pressionado o botão de energia por 5 segundos...',
        confidence: 0.95
      }
    ],
    sugestao: 'Encontrei informações relevantes sobre reinício de impressoras fiscais.'
  };
}

export async function consultarChamado(chamadoId: number): Promise<{ status: string; ultimoComentario?: string; criadoEm: string }> {
  // Mock implementation
  return {
    status: 'em_atendimento',
    ultimoComentario: 'Estamos investigando o problema.',
    criadoEm: '2024-01-15T10:00:00Z'
  };
}

export async function abrirChamado(dados: {
  titulo: string;
  descricao: string;
  categoriaId: number;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  solicitanteId: string;
}): Promise<{ chamadoId: number; mensagem: string }> {
  // Mock implementation
  return {
    chamadoId: 12345,
    mensagem: 'Chamado criado com sucesso'
  };
}

export async function escalarHumano(dados: {
  filial: string;
  sistema: string;
  mensagemErro: string;
  desdeQuando: string;
}): Promise<{ sucesso: boolean; mensagem: string }> {
  // Mock implementation
  return {
    sucesso: true,
    mensagem: 'Solicitação de escalonamento enviada. Um atendente entrará em contato em breve.'
  };
}

// Core API function
export async function chamarAPI(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  if (!config.baseUrl) {
    throw new Error('API base URL não configurada. Defina VITE_AGENT_API_BASE_URL.');
  }

  const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export { config };