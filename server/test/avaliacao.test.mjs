import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carregarCenarios, avaliar } from '../../cenarios/executor.mjs';

test('avalia 25 conversas fictícias e detecta expectativas incorretas', async () => {
  const cenarios = await carregarCenarios();
  assert.equal(cenarios.length, 25);
  assert.equal(new Set(cenarios.map(c => c.id)).size, 25);
  const relatorio = await avaliar(cenarios);
  assert.equal(relatorio.total, 25);
  assert.equal(relatorio.aprovados, 25);
  const alterado = structuredClone(cenarios[0]);
  alterado.turnos[0].esperado.contem = 'texto impossível';
  const falha = await avaliar([alterado]);
  assert.equal(falha.aprovados, 0);
  assert.equal(falha.resultados[0].passou, false);
});
