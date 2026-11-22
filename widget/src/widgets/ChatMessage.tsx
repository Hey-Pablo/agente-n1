/**
 * Chat Message Component
 *
 * Exibe uma mensagem única no chat com destaque para:
 * - Mensagem do usuário vs assistente
 * - Fontes citadas
 * - Botões de ação
 */

import { Mensagem } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Check, Copy, ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  mensagem: Mensagem;
}

export function ChatMessage({ mensagem }: ChatMessageProps) {
  const isUser = mensagem.role === 'user';
  const isAssistant = mensagem.role === 'assistant';

  return (
    <div
      className={cn(
        'chat-message',
        isUser ? 'chat-message--user' : 'chat-message--assistant'
      )}
    >
      <div className="chat-bubble">
        {mensagem.content.split('\n').map((line, i) => (
          <p key={i} className={cn('mb-2 last:mb-0')}>
            {isMarkdown(line) ? (
              <MarkdownRenderer content={line} />
            ) : (
              line
            )}
          </p>
        ))}
      </div>

      {isAssistant && mensagem.citedSources && (
        <div className="chat-sources">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Fontes citadas:</h4>
          <ul className="space-y-1">
            {mensagem.citedSources.map((source, index) => (
              <li key={source.id} className="flex items-start gap-2 text-xs">
                <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-700">{source.title}</div>
                  <p className="text-gray-500 text-xs mt-0.5">{source.snippet}</p>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => navigator.clipboard.writeText(source.snippet)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copiar trecho"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                        title="Abrir fonte"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isUser && (
        <div className="chat-actions">
          <button
            className="text-xs text-gray-400 hover:text-gray-600"
            onClick={() => navigator.clipboard.writeText(mensagem.content)}
            title="Copiar mensagem"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function isMarkdown(content: string): boolean {
  return (
    content.includes('#') ||
    content.includes('**') ||
    content.includes('*') ||
    content.includes('`') ||
    content.includes('```') ||
    content.includes('[')
  );
}

interface MarkdownRendererProps {
  content: string;
}

function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown rendering for common cases
  const lines = content.split('\n');

  return lines.map((line, i) => {
    // Headers
    if (line.startsWith('# ')) {
      return <h4 key={i} className="font-bold text-sm mt-2 mb-1">{line.slice(2)}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h5 key={i} className="font-semibold text-xs mt-2 mb-1">{line.slice(3)}</h5>;
    }

    // Bold
    const boldMatch = line.match(/\*\*(.+?)\*\*/);
    if (boldMatch) {
      return (
        <p key={i} className="mb-2">
          {line.replace(boldMatch[0], `<strong>${boldMatch[1]}</strong>`)}
        </p>
      );
    }

    // Code
    if (line.includes('`')) {
      const codeMatch = line.match(/`(.+?)`/);
      if (codeMatch) {
        return (
          <code key={i} className="bg-gray-100 px-1 py-0.5 rounded text-xs">
            {codeMatch[1]}
          </code>
        );
      }
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      return <li key={i} className="ml-4 text-xs list-disc">{line.replace(/^\d+\.\s/, '')}</li>;
    }

    // Bullet list
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-4 text-xs list-disc">{line.slice(2)}</li>;
    }

    return <p key={i} className="mb-2">{line}</p>;
  });
}