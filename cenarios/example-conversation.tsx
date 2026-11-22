/**
 * Example conversation scenario
 *
 * This file contains a sample conversation that demonstrates the agent's capabilities
 */

import { Mensagem } from '../types/chat';
import { EscalationInfo } from '../types/chat';

export interface Cenario {
  id: string;
  title: string;
  steps: Mensagem[];
  expectedOutcome: string;
  escalate?: boolean;
  escalationInfo?: EscalationInfo;
}

export const cenario1: Cenario = {
  id: '1',
  title: 'Resolução de problema de impressora fiscal',
  steps: [
    {
      id: '1',
      role: 'user',
      content: 'A impressora da loja 12 não imprime cupom fiscal. O erro é "Fila de impressão bloqueada".',
      timestamp: new Date('2024-01-15T10:00:00')
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Para resolver o problema de fila de impressão bloqueada, recomendo reiniciar a impressora. Segue o passo a passo:\n\n1. Desligue a impressora fiscais por 5 segundos\n2. Pressione o botão de reset\n3. Ligue novamente\n\nSe não resolver, verifique se há atualização do certificado digital.\n\nFontes: Artigo sobre reinício de impressora fiscal',
      citedSources: [
        {
          id: 'fonte-1',
          title: 'Reinício de Impressora Fiscal',
          snippet: 'Para reiniciar uma impressora fiscal, pressione e mantenha pressionado o botão de energia por 5 segundos...',
          confidence: 0.95
        }
      ],
      hasToolResults: false
    },
    {
      id: '3',
      role: 'user',
      content: 'Não funcionou. A mensagem continua a mesma.',
      timestamp: new Date('2024-01-15T10:15:00')
    },
    {
      id: '4',
      role: 'assistant',
      content: 'Entendido. Vamos tentar reiniciar o serviço de impressão. Abra o Painel de Controle > Serviços e reinicie o serviço "Serviço de Impressão Fiscal".',
      citedSources: [],
      hasToolResults: false
    },
    {
      id: '5',
      role: 'user',
      content: 'Fiz isso e agora o cupom foi impresso. Obrigado!',
      timestamp: new Date('2024-01-15T10:30:00')
    },
    {
      id: '6',
      role: 'assistant',
      content: 'Excelente! O problema foi resolvido. Obrigado por usar o Agente N1.',
      citedSources: [],
      hasToolResults: false
    }
  ],
  expectedOutcome: 'Resolução do problema de impressora',
  escalate: false
};

export const cenario2: Cenario = {
  id: '2',
  title: 'Consulta de status de chamado',
  steps: [
    {
      id: '1',
      role: 'user',
      content: 'Qual o status do chamado 1042?',
      timestamp: new Date('2024-01-16T09:00:00')
    },
    {
      id: '2',
      role: 'assistant',
      content: 'O chamado 1042 está em "em atendimento". O último comentário foi: "Estamos investigando o problema".',
      citedSources: [],
      hasToolResults: false
    }
  ],
  expectedOutcome: 'Status do chamado consultado',
  escalate: false
};

export const cenario3: Cenario = {
  id: '3',
  title: 'Escalonamento para atendente',
  steps: [
    {
      id: '1',
      role: 'user',
      content: 'O problema é que a impressora não está ligando mais. O erro é "Hardware não encontrado".',
      timestamp: new Date('2024-01-17T11:00:00')
    },
    {
      id: '2',
      role: 'assistant',
      content: 'O problema "Hardware não encontrado" pode ser mais complexo. Vamos abrir um chamado para um atendente especializado.',
      citedSources: [],
      hasToolResults: false
    },
    {
      id: '3',
      role: 'user',
      content: 'Ok, pode abrir.',
      timestamp: new Date('2024-01-17T11:05:00')
    },
    {
      id: '4',
      role: 'assistant',
      content: 'Processando...',
      citedSources: [],
      hasToolResults: false
    },
    {
      id: '5',
      role: 'assistant',
      content: 'Chamado 12345 criado com sucesso. Um atendente entrará em contato em breve.',
      citedSources: [],
      hasToolResults: true,
      escalate: true,
      escalationInfo: {
        filial: 'Loja 12',
        sistema: 'Impressora Fiscal',
        mensagemErro: 'Hardware não encontrado',
        desdeQuando: 'Há 1 hora'
      }
    }
  ],
  expectedOutcome: 'Chamado aberto com sucesso',
  escalate: true,
  escalationInfo: {
    filial: 'Loja 12',
    sistema: 'Impressora Fiscal',
    mensagemErro: 'Hardware não encontrado',
    desdeQuando: 'Há 1 hora'
  }
};