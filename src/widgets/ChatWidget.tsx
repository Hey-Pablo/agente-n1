/**
 * Chat Widget Component
 *
 * Componente principal do widget de chat com:
 * - Histórico de mensagens
 * - Botão "Falar com atendente"
 * - Confirmação antes de abrir chamado
 */

import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Mensagem, ChatStatus, EscalationInfo, CitedSource } from '../types/chat';
import { enviarMensagem } from '../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { EscalationDialog } from './EscalationDialog';
import { Button } from '../components/Button';

interface ResultadoEnvio {
  content: string;
  sources?: CitedSource[];
  hasToolResults: boolean;
  escalate?: boolean;
  escalationInfo?: EscalationInfo;
}

export interface ChatWidgetProps {
  sessionId: string;
  userName?: string;
  defaultTitle?: string;
}

export function ChatWidget({ sessionId, userName = 'Usuário', defaultTitle = 'Assistente N1' }: ChatWidgetProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [escalationInfo, setEscalationInfo] = useState<EscalationInfo | null>(null);
  const [mostrarEscalation, setMostrarEscalation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carrega histórico do localStorage
  useEffect(() => {
    const historicoSalvo = localStorage.getItem(`chat-historico-${sessionId}`);
    if (historicoSalvo) {
      try {
        const dados = JSON.parse(historicoSalvo);
        setMensagens(
          dados.mensagens.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        );
      } catch {
        // Ignora erros de parsing
      }
    }
  }, [sessionId]);

  // Salva histórico no localStorage
  useEffect(() => {
    if (mensagens.length > 0) {
      localStorage.setItem(
        `chat-historico-${sessionId}`,
        JSON.stringify({
          mensagens,
          ferramentas: [],
          custoEstimado: 0,
          duracao: 0
        })
      );
    }
  }, [mensagens, sessionId]);

  // Scroll automático para o final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, status]);

  const handleSendMessage = async (content: string) => {
    const novaMensagem: Mensagem = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMensagens(prev => [...prev, novaMensagem]);
    setStatus('thinking');

    try {
      const resultado: ResultadoEnvio = await enviarMensagem(content, sessionId);

      const respostaMensagem: Mensagem = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: resultado.content,
        timestamp: new Date(),
        citedSources: resultado.sources,
        hasToolResults: resultado.hasToolResults
      };

      setMensagens(prev => [...prev, respostaMensagem]);

      // Verifica se o agente pediu escalonamento
      if (resultado.escalate) {
        setEscalationInfo(resultado.escalationInfo || null);
        setMostrarEscalation(true);
      }
    } catch (error) {
      const erroMensagem: Mensagem = {
        id: `msg-erro-${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      setMensagens(prev => [...prev, erroMensagem]);
    } finally {
      setStatus('idle');
    }
  };

  const handleEscalationConfirm = () => {
    if (escalationInfo) {
      // Processa o escalonamento
      console.log('Escalando para atendente humano:', escalationInfo);
      setMostrarEscalation(false);
      setEscalationInfo(null);

      const escalacaoMensagem: Mensagem = {
        id: `msg-escal-${Date.now()}`,
        role: 'assistant',
        content: escalationInfo.resumo || 'Encaminhando para atendimento humano...',
        timestamp: new Date()
      };
      setMensagens(prev => [...prev, escalacaoMensagem]);
    }
  };

  const handleEscalationCancel = () => {
    setMostrarEscalation(false);
    setEscalationInfo(null);
  };

  const handleEscalationDirect = () => {
    setMostrarEscalation(true);
  };

  return (
    <div className="chat-widget">
      <ChatHeader
        title={defaultTitle}
        userName={userName}
        mensagensCount={mensagens.length}
      />

      <div className="chat-messages">
        {mensagens.map(mensagem => (
          <ChatMessage
            key={mensagem.id}
            mensagem={mensagem}
          />
        ))}

        {status === 'thinking' && (
          <div className="chat-thinking">
            <div className="thinking-bubble">
              <span>...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={status !== 'idle'}
        placeholder="Digite sua pergunta..."
      />

      <div className="chat-actions">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEscalationDirect}
          className="flex-1"
        >
          Falar com atendente
        </Button>
      </div>

      <EscalationDialog
        isOpen={mostrarEscalation}
        onConfirm={handleEscalationConfirm}
        onCancel={handleEscalationCancel}
        onOpenChange={setMostrarEscalation}
      />
    </div>
  );
}