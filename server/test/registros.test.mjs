import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { criarRegistros } from '../../dist/registros.js';

test('confirmação é vinculada à conversa e consumida apenas uma vez', async () => {
 const db=new PGlite(); const r=criarRegistros(db); await r.iniciar();
 const dados={filial:'12',sistema:'PDV',erro:'falha',desde:'hoje'};
 await r.preparar('c1',dados);
 assert.equal(await r.consumir('c2'),null);
 assert.deepEqual(await r.consumir('c1'),dados);
 assert.equal(await r.consumir('c1'),null);
 await db.close();
});

test('registra eventos parametrizados e limita uso', async () => {
 const db=new PGlite(); const r=criarRegistros(db); await r.iniciar();
 await r.registrar('c1',{tipo:'mensagem',conteudo:"teste ' fictício",custo:0.1,duracao_ms:42});
 const dados=await db.query('select evento from registros'); assert.equal(dados.rows[0].evento.conteudo,"teste ' fictício");
 assert.equal(await r.consumirUso('c1',1),true); assert.equal(await r.consumirUso('c1',1),false);
 await db.close();
});
