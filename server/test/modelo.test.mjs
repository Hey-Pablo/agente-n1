import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarModelo } from '../../dist/modelo.js';

test('envia ferramentas e interpreta chamada compatível', async () => {
 let corpo; const modelo=criarModelo({baseUrl:'https://ia.test/v1',apiKey:'ficticia',model:'teste',sistema:'política',fetcher:async (_u,o)=>{corpo=JSON.parse(o.body); return Response.json({choices:[{message:{content:null,tool_calls:[{id:'a',function:{name:'buscarBase',arguments:'{"pergunta":"teste"}'}}]}}],usage:{prompt_tokens:5,completion_tokens:3}})}});
 const resposta=await modelo.responder([{role:'user',content:'teste'}]); assert.equal(resposta.tool_calls[0].function.name,'buscarBase'); assert.equal(corpo.tools.length,4); assert.equal(corpo.messages[0].content,'política');
});
