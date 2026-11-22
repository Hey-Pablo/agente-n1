export type Call = {id:string; function:{name:string; arguments:string}};
export type Mensagem = {role:string; content?:string|null; tool_calls?:Call[]; tool_call_id?:string};
export type Modelo = {responder:(mensagens:Mensagem[])=>Promise<{content?:string|null; tool_calls?:Call[]}>};
export type Ferramentas = Record<string,(args:Record<string,unknown>)=>Promise<unknown>>;
export type Entrada = {mensagem:string; modelo:Modelo; ferramentas:Ferramentas; registrar:(evento:unknown)=>Promise<void>; historico?:Mensagem[]; maxPassos?:number};
const campos = ['filial','sistema','erro','desde'] as const;
export async function executar({mensagem,modelo,ferramentas,registrar,historico=[],maxPassos=6}:Entrada):Promise<string> {
 if(typeof mensagem !== 'string' || !mensagem.trim() || mensagem.length>2000) throw new Error('Mensagem inválida');
 const inicio=Date.now(); const mensagens:Mensagem[]=[...historico,{role:'user',content:mensagem}];
 await registrar({tipo:'mensagem',papel:'usuario',conteudo:mensagem});
 for(let passo=0;passo<Math.min(Math.max(maxPassos,1),10);passo++) {
  const resposta=await modelo.responder(mensagens); mensagens.push({role:'assistant',...resposta});
  if(!resposta.tool_calls?.length) {const texto=resposta.content || 'Não foi possível responder. Procure um atendente.'; await registrar({tipo:'mensagem',papel:'assistente',conteudo:texto,duracao_ms:Date.now()-inicio}); return texto;}
  for(const chamada of resposta.tool_calls) {
   let args:Record<string,unknown>; try {const parsed:unknown=JSON.parse(chamada.function.arguments); if(!parsed || typeof parsed!=='object' || Array.isArray(parsed)) throw 0; args=parsed as Record<string,unknown>;} catch {throw new Error('Argumentos inválidos');}
   const nome=chamada.function.name; if(!Object.hasOwn(ferramentas,nome)) throw new Error('Ferramenta desconhecida');
   if(nome==='abrirChamado') {
    const faltam=campos.filter(c=>typeof args[c]!=='string' || !(args[c] as string).trim() || (args[c] as string).length>500);
    if(faltam.length) return `Informe: ${faltam.join(', ')}.`;
    // A confirmação deve ser persistida e vinculada ao resumo antes da ação real.
    return `Resumo: filial ${args.filial}; sistema ${args.sistema}; erro ${args.erro}; desde ${args.desde}. Você confirma a abertura do chamado?`;
   }
   const resultado=await ferramentas[nome](args); await registrar({tipo:'ferramenta',nome,argumentos:args,resultado,duracao_ms:Date.now()-inicio}); mensagens.push({role:'tool',tool_call_id:chamada.id,content:JSON.stringify(resultado)});
  }
 }
 return 'Limite de etapas atingido. Procure um atendente.';
}
