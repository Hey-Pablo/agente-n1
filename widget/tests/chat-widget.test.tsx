import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/App';
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });
it('envia mensagem autenticada e apresenta resposta e confirmação', async () => {
 const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({resposta:'Resumo: filial 12. Você confirma a abertura do chamado?'}), {status:200, headers:{'Content-Type':'application/json'}}));
 const user = userEvent.setup(); render(<App />);
 await user.type(screen.getByLabelText('JWT de acesso'), 'jwt-ficticio');
 await user.type(screen.getByLabelText('ID da conversa RAG'), 'rag-123');
 await user.type(screen.getByLabelText('Mensagem'), 'Preciso de ajuda');
 await user.click(screen.getByRole('button', {name:'Enviar'}));
 expect(await screen.findByText(/Resumo: filial 12/)).toBeInTheDocument();
 expect(fetcher).toHaveBeenCalledWith('/chat', expect.objectContaining({method:'POST',headers:expect.objectContaining({Authorization:'Bearer jwt-ficticio'}),body:expect.stringContaining('rag-123')}));
 expect(screen.getByRole('button',{name:'Confirmar'})).toBeInTheDocument();
 await user.click(screen.getByRole('button',{name:'Cancelar'}));
 expect(fetcher).toHaveBeenLastCalledWith('/chat', expect.objectContaining({body:expect.stringContaining('não')}));
});

it('botão falar com atendente pede o encaminhamento direto', async () => {
 const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({resposta:'Pedido encaminhado a um atendente.',protocolo:'7'}), {status:200, headers:{'Content-Type':'application/json'}}));
 const user = userEvent.setup(); render(<App />);
 await user.type(screen.getByLabelText('JWT de acesso'), 'jwt-ficticio');
 await user.type(screen.getByLabelText('ID da conversa RAG'), 'rag-123');
 await user.click(screen.getByRole('button',{name:'Falar com atendente'}));
 expect(await screen.findByText(/encaminhado a um atendente/)).toBeInTheDocument();
 expect(fetcher).toHaveBeenCalledWith('/chat', expect.objectContaining({body:expect.stringContaining('"acao":"escalar"')}));
});
