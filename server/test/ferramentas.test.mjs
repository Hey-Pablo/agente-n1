import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarFerramentasSimuladas, criarFerramentasReais, contratos } from '../../dist/ferramentas.js';

test('ferramentas simuladas consultam e abrem dados fictícios', async () => {
 const f = criarFerramentasSimuladas();
 assert.match((await f.buscarBase({pergunta:'impressora'})).resposta, /impressora/i);
 assert.equal((await f.consultarChamado({id:1042})).status, 'aberto');
 assert.equal((await f.abrirChamado({filial:'12',sistema:'PDV',erro:'falha',desde:'hoje'})).id, 1043);
 assert.equal((await f.escalarHumano({motivo:'não resolveu'})).encaminhado, true);
 assert.equal(contratos.length, 4);
});

test('cliente real envia identidade e filtra comentários internos', async () => {
 const requests=[];
 const fetcher=async (url, options={}) => { requests.push({url:String(url), options});
  if(String(url).includes('comentarios')) return Response.json([{texto:'público'}]);
  if(String(url).includes('chamados')) return Response.json([{id:1042,status:'aberto'}]);
  return Response.json({resposta:'Solução',fontes:[]}); };
 const f=criarFerramentasReais({ragUrl:'https://rag.test/perguntar',helpdeskUrl:'https://desk.test/rest/v1',ragKey:'publica',helpdeskKey:'publica',token:'jwt-ficticio',conversaId:'00000000-0000-0000-0000-000000000001',usuarioId:'00000000-0000-0000-0000-000000000002',categoriaId:1,fetcher});
 assert.equal((await f.buscarBase({pergunta:'ajuda'})).resposta,'Solução');
 assert.equal((await f.consultarChamado({id:1042})).ultimoComentario,'público');
 assert.match(requests[2].url,/interno=eq.false/);
 assert.equal(requests[0].options.headers.Authorization,'Bearer jwt-ficticio');
});

test('argumentos inválidos não alcançam rede', async () => {
 let calls=0; const f=criarFerramentasReais({ragUrl:'https://rag.test/perguntar',helpdeskUrl:'https://desk.test/rest/v1',ragKey:'x',helpdeskKey:'x',token:'x',conversaId:'x',usuarioId:'x',categoriaId:1,fetcher:async()=>{calls++; throw Error()}});
 await assert.rejects(f.consultarChamado({id:'1&status=eq.aberto'})); assert.equal(calls,0);
});
