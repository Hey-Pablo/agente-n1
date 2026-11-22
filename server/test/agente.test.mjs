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
