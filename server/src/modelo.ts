import { contratos } from './ferramentas.js';
import type { Mensagem } from './agente.js';
type Config = {baseUrl:string;apiKey:string;model:string;sistema:string;fetcher?:typeof fetch; registrarUso?:(uso:unknown)=>Promise<void>};
export function criarModelo(c:Config) {
 return { async responder(mensagens:Mensagem[]) {
  const inicio=Date.now();
  const resposta=await (c.fetcher ?? fetch)(`${c.baseUrl.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${c.apiKey}`},body:JSON.stringify({model:c.model,messages:[{role:'system',content:c.sistema},...mensagens],tools:contratos,tool_choice:'auto',max_tokens:1000}),signal:AbortSignal.timeout(30000),redirect:'error'});
  if(!resposta.ok) throw new Error('Falha no provedor de IA');
  const dados=await resposta.json() as {choices?:{message?:{content?:string|null;tool_calls?:{id:string;function:{name:string;arguments:string}}[]}}[];usage?:unknown};
  if(!dados.choices?.[0]?.message) throw new Error('Resposta inválida do provedor');
  await c.registrarUso?.({tipo:'modelo',modelo:c.model,uso:dados.usage ?? null,duracao_ms:Date.now()-inicio});
  return dados.choices[0].message;
 }};
}
