import { test } from 'node:test';
import assert from 'node:assert/strict';
import { executar } from '../../dist/agente.js';

test('não abre chamado sem confirmação explícita', async () => {
  let abertos = 0;
  const modelo = { responder: async () => ({ tool_calls: [{ id: '1', function: { name: 'abrirChamado', arguments: JSON.stringify({ filial: '12', sistema: 'PDV', erro: 'falha', desde: 'hoje' }) } }] }) };
  const ferramentas = { abrirChamado: async () => { abertos++; return {}; } };
  const resposta = await executar({ mensagem: 'abra', modelo, ferramentas, registrar: async () => {} });
  assert.equal(abertos, 0);
  assert.match(resposta, /confirma/i);
});

test('limita o laço quando o modelo continua chamando ferramentas', async () => {
 let chamadas = 0;
 const modelo = { responder: async () => ({ tool_calls: [{ id: String(++chamadas), function: { name: 'buscarBase', arguments: '{}' } }] }) };
 const resposta = await executar({ mensagem: 'ajuda', modelo, ferramentas: { buscarBase: async () => ({}) }, registrar: async () => {}, maxPassos: 2 });
 assert.equal(chamadas, 2); assert.match(resposta, /Limite/);
});

test('exige dados antes de pedir confirmação', async () => {
 const modelo = { responder: async () => ({ tool_calls: [{ id: '1', function: { name: 'abrirChamado', arguments: '{}' } }] }) };
 const resposta = await executar({ mensagem: 'ajuda', modelo, ferramentas: { abrirChamado: async () => { throw Error('não deve abrir'); } }, registrar: async () => {} });
 assert.match(resposta, /filial, sistema, erro, desde/);
});

test('rejeita ferramenta desconhecida', async () => {
 const modelo = { responder: async () => ({ tool_calls: [{ id: '1', function: { name: 'desconhecida', arguments: '{}' } }] }) };
 await assert.rejects(executar({ mensagem: 'ajuda', modelo, ferramentas: {}, registrar: async () => {} }), /Ferramenta desconhecida/);
});

test('confirmação explícita consome resumo salvo antes de abrir', async () => {
 let pendente; let aberto=0;
 const registros={preparar:async (_,d)=>{pendente=d},consumir:async()=>{const d=pendente;pendente=null;return d},consumirUso:async()=>true};
 const modelo={responder:async()=>({tool_calls:[{id:'1',function:{name:'abrirChamado',arguments:JSON.stringify({filial:'12',sistema:'PDV',erro:'falha',desde:'hoje'})}}]})};
 const ferramentas={abrirChamado:async d=>{aberto++;return {id:1043,...d}}};
 const entrada={modelo,ferramentas,registrar:async()=>{},registros,conversaId:'c1'};
 assert.match(await executar({...entrada,mensagem:'abra'}),/confirma/i); assert.equal(aberto,0);
 assert.match(await executar({...entrada,mensagem:'sim'}),/1043/); assert.equal(aberto,1);
 assert.match(await executar({...entrada,mensagem:'sim'}),/confirma/i); assert.equal(aberto,1);
});

test('uma resposta diferente de sim invalida a confirmação anterior', async () => {
 let pendente; let aberto=0; let rodada=0;
 const registros={preparar:async (_,d)=>{pendente=d},consumir:async()=>{const d=pendente;pendente=null;return d},consumirUso:async()=>true};
 const modelo={responder:async()=>++rodada===1 ? {tool_calls:[{id:'1',function:{name:'abrirChamado',arguments:JSON.stringify({filial:'12',sistema:'PDV',erro:'falha',desde:'hoje'})}}]} : {content:'Tudo bem.'}};
 const entrada={modelo,ferramentas:{abrirChamado:async()=>{aberto++;return {id:1}}},registrar:async()=>{},registros,conversaId:'c1'};
 await executar({...entrada,mensagem:'abrir'}); await executar({...entrada,mensagem:'não'}); await executar({...entrada,mensagem:'sim'}); assert.equal(aberto,0);
});
