import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { executar } from '../dist/agente.js';
import { criarFerramentasSimuladas } from '../dist/ferramentas.js';
import { criarModelo } from '../dist/modelo.js';

export async function carregarCenarios() {
  return JSON.parse(await readFile(new URL('./conversas.json', import.meta.url), 'utf8'));
}

// O roteiro controla o modelo falso, não o resultado das ferramentas nem os guardas.
function modeloFalso(turno) {
  let chamada = false;
  return { async responder() {
    if (turno.acao && !chamada) {
      chamada = true;
      return { tool_calls: [{ id: '1', function: { name: turno.acao, arguments: JSON.stringify(turno.argumentos) } }] };
    }
    return { content: turno.resposta ?? 'Entendido.' };
  } };
}
function registrosMemoria() {
  let pendente = null, coleta = null;
  return {
    preparar: async (_id, dados) => { pendente = dados; },
    consumir: async () => { const dados = pendente; pendente = null; return dados; },
    consumirUso: async () => true,
    obterColeta: async () => coleta,
    salvarColeta: async (_id, dados) => { coleta = dados; },
    limparColeta: async () => { coleta = null; },
  };
}
export async function avaliar(cenarios, modeloReal = null) {
  const resultados = [];
  for (const cenario of cenarios) {
    const ferramentas = criarFerramentasSimuladas();
    const registros = registrosMemoria();
    const historico = [];
    let aberturas = 0;
    const abrir = ferramentas.abrirChamado;
    ferramentas.abrirChamado = async args => { aberturas++; return abrir(args); };
    const turnos = [];
    for (const turno of cenario.turnos) {
      const eventos = [];
      try {
        const resposta = await executar({ mensagem: turno.entrada, modelo: modeloReal ?? modeloFalso(turno), ferramentas, registros, conversaId: cenario.id, historico, registrar: async evento => eventos.push(evento) });
        historico.push({ role: 'user', content: turno.entrada }, { role: 'assistant', content: resposta });
        const chamadas = eventos.filter(e => e.tipo === 'ferramenta').map(e => e.nome);
        const esperado = turno.esperado;
        const passou = resposta.toLocaleLowerCase('pt-BR').includes(esperado.contem.toLocaleLowerCase('pt-BR')) && (!esperado.ferramenta || chamadas.includes(esperado.ferramenta)) && aberturas === esperado.aberturas;
        turnos.push({ entrada: turno.entrada, resposta, chamadas, aberturas, esperado, passou });
      } catch (erro) {
        turnos.push({ entrada: turno.entrada, erro: 'Falha ao executar o turno', passou: false });
      }
    }
    resultados.push({ id: cenario.id, categoria: cenario.categoria, passou: turnos.every(t => t.passou), turnos });
  }
  return { data: new Date().toISOString(), modelo: modeloReal ? process.env.MODEL : 'falso determinístico', total: resultados.length, aprovados: resultados.filter(r => r.passou).length, resultados };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const real = process.argv.includes('--real');
  if (real && (!process.env.API_KEY || !process.env.MODEL)) throw new Error('Defina API_KEY e MODEL para o modelo real.');
  const sistema = await readFile(new URL('../server/src/prompts/sistema.md', import.meta.url), 'utf8');
  const modelo = real ? criarModelo({ baseUrl: process.env.BASE_URL || 'https://freellmapi.com/v1', apiKey: process.env.API_KEY, model: process.env.MODEL, sistema }) : null;
  const relatorio = await avaliar(await carregarCenarios(), modelo);
  const destino = process.argv.find(a => a.startsWith('--saida='))?.slice(8);
  if (destino) await writeFile(destino, JSON.stringify(relatorio, null, 2) + '\n');
  console.log(JSON.stringify(relatorio, null, 2));
  if (relatorio.aprovados !== relatorio.total) process.exitCode = 1;
}
