type Args = Record<string, unknown>;
type Fetch = typeof fetch;
const texto = (v:unknown, nome:string, limite=500):string => { if(typeof v !== 'string' || !v.trim() || v.length>limite) throw new Error(`${nome} inválido`); return v.trim(); };
const idValido = (v:unknown):number => { if(typeof v !== 'number' || !Number.isSafeInteger(v) || v<1) throw new Error('id inválido'); return v; };
const propriedades = {filial:{type:'string',minLength:1,maxLength:500},sistema:{type:'string',minLength:1,maxLength:500},erro:{type:'string',minLength:1,maxLength:500},desde:{type:'string',minLength:1,maxLength:500}};
const schema = (properties:object, required:string[]) => ({type:'object',properties,required,additionalProperties:false});
export const contratos = [
 {type:'function',function:{name:'buscarBase',description:'Busca uma solução documentada',parameters:schema({pergunta:{type:'string',minLength:1,maxLength:2000}},['pergunta'])}},
 {type:'function',function:{name:'consultarChamado',description:'Consulta o status e último comentário público',parameters:schema({id:{type:'integer',minimum:1}},['id'])}},
 {type:'function',function:{name:'abrirChamado',description:'Solicita abertura após confirmação',parameters:schema(propriedades,Object.keys(propriedades))}},
 {type:'function',function:{name:'escalarHumano',description:'Encaminha para atendimento humano',parameters:schema({motivo:{type:'string',minLength:1,maxLength:500}},['motivo'])}}
];
function dados(args:Args) { return {filial:texto(args.filial,'filial'),sistema:texto(args.sistema,'sistema'),erro:texto(args.erro,'erro'),desde:texto(args.desde,'desde')}; }
export function criarFerramentasSimuladas() {
 let proximo=1043;
 return {
  async buscarBase(args:Args) { texto(args.pergunta,'pergunta',2000); return {resposta:'Exemplo fictício: consulte o procedimento de impressora na base.',fontes:[{titulo:'Impressora (exemplo)'}]}; },
  async consultarChamado(args:Args) { const id=idValido(args.id); return id===1042?{id,status:'aberto',ultimoComentario:'Em análise.'}:null; },
  async abrirChamado(args:Args) { dados(args); return {id:proximo++,status:'aberto'}; },
  async escalarHumano(args:Args) { texto(args.motivo,'motivo'); return {encaminhado:true,simulado:true}; }
 };
}
type Config = {ragUrl:string;helpdeskUrl:string;ragKey:string;helpdeskKey:string;token:string;conversaId:string;usuarioId:string;categoriaId:number;fetcher?:Fetch};
export function criarFerramentasReais(c:Config) {
 const request=c.fetcher ?? fetch;
 const headers=(key:string)=>({'Content-Type':'application/json',apikey:key,Authorization:`Bearer ${c.token}`});
 async function json(url:string,init:RequestInit) { const r=await request(url,{...init,redirect:'error',signal:AbortSignal.timeout(10000)}); if(!r.ok) throw new Error('Falha na integração'); return await r.json() as any; }
 const root=c.helpdeskUrl.replace(/\/$/,'');
 return {
  async buscarBase(args:Args) {const pergunta=texto(args.pergunta,'pergunta',2000); return json(c.ragUrl,{method:'POST',headers:headers(c.ragKey),body:JSON.stringify({pergunta,conversa_id:c.conversaId})});},
  async consultarChamado(args:Args) {const id=idValido(args.id); const chamados=await json(`${root}/chamados?id=eq.${id}&select=id,status`,{headers:headers(c.helpdeskKey)}); if(!Array.isArray(chamados)||!chamados[0]) return null; const comentarios=await json(`${root}/comentarios?chamado_id=eq.${id}&interno=eq.false&select=texto&order=criado_em.desc&limit=1`,{headers:headers(c.helpdeskKey)}); return {...chamados[0],ultimoComentario:comentarios[0]?.texto ?? null};},
  async abrirChamado(args:Args) {const d=dados(args); const body={titulo:`Suporte ${d.sistema}`.slice(0,200),descricao:`Filial: ${d.filial}\nSistema: ${d.sistema}\nErro: ${d.erro}\nDesde: ${d.desde}`,categoria_id:idValido(c.categoriaId),prioridade:'media',solicitante_id:c.usuarioId}; const result=await json(`${root}/chamados?select=id,status`,{method:'POST',headers:{...headers(c.helpdeskKey),Prefer:'return=representation'},body:JSON.stringify(body)}); return result[0];},
  async escalarHumano(args:Args) {texto(args.motivo,'motivo'); return {encaminhado:false,mensagem:'Procure um atendente humano; integração de fila não configurada.'};}
 };
}
