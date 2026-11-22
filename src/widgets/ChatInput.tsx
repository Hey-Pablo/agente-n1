/**
 * Chat Input Component
 *
 * Campo de input com botão de envio e contador de caracteres
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Digite sua mensagem...',
  maxLength = 1000
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-foco ao montar
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setInputValue(value);
      setCharCount(value.length);
    }
  };

  const handleSubmit = async () => {
    if (inputValue.trim() && !disabled) {
      await onSendMessage(inputValue.trim());
      setInputValue('');
      setCharCount(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input__actions">
        <button
          type="button"
          className="chat-input__action"
          aria-label="Emoji"
          disabled={disabled}
        >
          <Smile className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <textarea
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'chat-input',
          disabled && 'chat-input--disabled'
        )}
        rows={1}
      />

      <div className="chat-input__actions">
        <div className="chat-input__counter">
          {charCount}/{maxLength}
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !inputValue.trim()}
          className={cn(
            'chat-input__send',
            !inputValue.trim() && 'chat-input__send--disabled'
          )}
          aria-label="Enviar mensagem"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}