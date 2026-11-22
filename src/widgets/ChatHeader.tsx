/**
 * Chat Header Component
 *
 * Cabeçalho do widget com título, nome do usuário e contador de mensagens
 */

import { MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatHeaderProps {
  title: string;
  userName?: string;
  mensagensCount: number;
}

export function ChatHeader({ title, userName = 'Usuário', mensagensCount }: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="chat-header__icon">
        <MessageCircle className="w-5 h-5 text-blue-500" />
      </div>
      <div className="chat-header__content">
        <h3 className="chat-header__title">{title}</h3>
        <p className="chat-header__subtitle">
          {userName} • {mensagensCount} mensagens
        </p>
      </div>
    </div>
  );
}