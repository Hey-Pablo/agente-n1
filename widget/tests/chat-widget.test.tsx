/**
 * Tests for ChatWidget component
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatWidget } from '@/widgets/ChatWidget';

// Mock the API
vi.mock('@/lib/api', () => ({
  config: {
    baseUrl: 'https://api.test.com',
    apiKey: 'test-key',
    defaultModel: 'gpt-3.5-turbo'
  },
  chamarAPI: vi.fn().mockResolvedValue({
    id: 'test-id',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-3.5-turbo',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: 'Test response'
      },
      finish_reason: 'stop'
    }]
  }),
  funcoesDisponiveis: [],
  buscarBase: vi.fn(),
  consultarChamado: vi.fn(),
  abrirChamado: vi.fn(),
  escalarHumano: vi.fn()
}));

describe('ChatWidget', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the chat header with correct title', () => {
    render(<ChatWidget sessionId="test-session" userName="Test User" defaultTitle="Test Assistant" />);

    expect(screen.getByText('Test Assistant')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Falar com atendente/i })).toBeInTheDocument();
  });

  it('should show 0 messages initially', () => {
    render(<ChatWidget sessionId="test-session" />);

    expect(screen.getByText(/0 mensagens/)).toBeInTheDocument();
  });

  it('should display the send button', () => {
    render(<ChatWidget sessionId="test-session" />);

    const sendButton = screen.getByLabelText('Enviar mensagem');
    expect(sendButton).toBeInTheDocument();
  });

  it('should render with default values', () => {
    render(<ChatWidget sessionId="test-session" />);

    expect(screen.getByText('Assistente N1')).toBeInTheDocument();
  });
});