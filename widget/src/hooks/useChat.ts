/**
 * Chat Hook
 *
 * Hook para gerenciar estado e comunicação com a API do agente
 */

import { useState } from 'react';
import { Mensagem, CitedSource, ChatCompletionRequest } from '@/types/chat';
import { chamarAPI, funcoesDisponiveis, escalarHumano } from '@/lib/api';
import { config } from '@/lib/api';

interface UseChatReturn {
  enviarMensagem: (content: string, sessionId: string) => Promise<{
    content: string;
    sources?: CitedSource[];
    hasToolResults: boolean;
    escalate?: boolean;
    escalationInfo?: any;
  }>;
}

export function useChat(): UseChatReturn {
  const [isProcessing, setIsProcessing] = useState(false);

  async function enviarMensagem(content: string, sessionId: string) {
    if (!config.baseUrl) {
      throw new Error('API base URL não configurada');
    }

    setIsProcessing(true);

    try {
      const request: ChatCompletionRequest = {
        model: config.defaultModel,
        messages: [
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        functions: funcoesDisponiveis,
        function_call: 'auto'
      };

      const response = await chamarAPI(request);
      const choice = response.choices[0];

      if (!choice) {
        throw new Error('Resposta vazia da API');
      }

      const message = choice.message;

      // Parse function calls if present
      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        if (toolCall.type === 'function' && toolCall.function.name === 'escalar_humano') {
          const args = JSON.parse(toolCall.function.arguments);

          // Call the escalation function
          const escalationResult = await escalarHumano(args);

          return {
            content: escalationResult.mensagem,
            sources: [],
            hasToolResults: true,
            escalate: true,
            escalationInfo: args
          };
        }
      }

      return {
        content: message.content || 'Sem resposta',
        sources: [],
        hasToolResults: false
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }

  return { enviarMensagem };
}

// Export a standalone function for use outside React components
export async function enviarMensagemStandalone(content: string, sessionId: string) {
  if (!config.baseUrl) {
    throw new Error('API base URL não configurada');
  }

  const request: ChatCompletionRequest = {
    model: config.defaultModel,
    messages: [
      {
        role: 'user',
        content
      }
    ],
    temperature: 0.7,
    max_tokens: 1000,
    functions: funcoesDisponiveis,
    function_call: 'auto'
  };

  const response = await chamarAPI(request);
  const choice = response.choices[0];

  if (!choice) {
    throw new Error('Resposta vazia da API');
  }

  const message = choice.message;

  // Parse function calls if present
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    if (toolCall.type === 'function' && toolCall.function.name === 'escalar_humano') {
      const args = JSON.parse(toolCall.function.arguments);

      // Call the escalation function
      const escalationResult = await escalarHumano(args);

      return {
        content: escalationResult.mensagem,
        sources: [],
        hasToolResults: true,
        escalate: true,
        escalationInfo: args
      };
    }
  }

  return {
    content: message.content || 'Sem resposta',
    sources: [],
    hasToolResults: false
  };
}