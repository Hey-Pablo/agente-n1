import { useState } from 'react';

type Message = { role: 'user' | 'assistant'; text: string };
const storageKey = 'agente-n1-historico';
export function App() {
  const [token, setToken] = useState('');
  const [ragId, setRagId] = useState('');
  const [conversationId] = useState(() => sessionStorage.getItem('agente-n1-conversa') || crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>(() => { try { return JSON.parse(sessionStorage.getItem(storageKey) || '[]'); } catch { return []; } });
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = messages.at(-1)?.role === 'assistant' && /Você confirma a abertura do chamado\?/i.test(messages.at(-1)?.text || '');
  async function send(text: string, acao?: 'escalar') {
    if (!token.trim() || !ragId.trim()) { setError('Informe o JWT de acesso e o ID da conversa RAG.'); return; }
    setBusy(true); setError('');
    const next: Message[] = [...messages, { role: 'user', text }];
    setMessages(next);
    try {
      const response = await fetch('/chat', { method:'POST', headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ mensagem:text, conversaId:conversationId, ragConversaId:ragId, ...(acao ? { acao } : {}) }) });
      if (!response.ok) throw new Error('Falha');
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || !('resposta' in data) || typeof data.resposta !== 'string') throw new Error('Resposta inválida');
      const updated: Message[] = [...next, { role:'assistant', text:data.resposta }];
      setMessages(updated); sessionStorage.setItem(storageKey, JSON.stringify(updated)); sessionStorage.setItem('agente-n1-conversa', conversationId);
    } catch { setError('Não foi possível enviar. Confira a sessão e tente novamente.'); }
    finally { setBusy(false); }
  }
  return <main><h1>Assistente N1</h1><p>Use dados fictícios. Não envie senhas ou tokens nas mensagens.</p>
    <label>JWT de acesso<input type="password" value={token} onChange={e => setToken(e.target.value)} autoComplete="off" /></label>
    <label>ID da conversa RAG<input value={ragId} onChange={e => setRagId(e.target.value)} /></label>
    <div aria-live="polite">{messages.map((m,i) => <p key={i}><strong>{m.role === 'user' ? 'Você' : 'Assistente'}:</strong> {m.text}</p>)}</div>
    {error && <p role="alert">{error}</p>}
    {pending && <div><button disabled={busy} onClick={() => void send('sim')}>Confirmar</button><button disabled={busy} onClick={() => void send('não')}>Cancelar</button></div>}
    <form onSubmit={e => { e.preventDefault(); if(input.trim()) { void send(input.trim()); setInput(''); } }}><label>Mensagem<textarea value={input} maxLength={2000} onChange={e => setInput(e.target.value)} /></label><button disabled={busy || !input.trim()}>Enviar</button></form>
    <button disabled={busy} onClick={() => void send('Quero falar com um atendente humano.', 'escalar')}>Falar com atendente</button>
  </main>;
}
