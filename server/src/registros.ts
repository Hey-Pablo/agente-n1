type Banco = {query:(sql:string, parametros?:any[])=>Promise<{rows:any[]}>; exec?:(sql:string)=>Promise<unknown>};
export function criarRegistros(db:Banco) {
 return {
  async iniciar() { for (const sql of `CREATE TABLE IF NOT EXISTS registros (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, conversa_id TEXT NOT NULL, evento JSONB NOT NULL, criado_em TIMESTAMPTZ NOT NULL DEFAULT now()); CREATE TABLE IF NOT EXISTS confirmacoes (conversa_id TEXT PRIMARY KEY, dados JSONB NOT NULL, criado_em TIMESTAMPTZ NOT NULL DEFAULT now()); CREATE TABLE IF NOT EXISTS uso (conversa_id TEXT NOT NULL, dia DATE NOT NULL DEFAULT CURRENT_DATE, quantidade INTEGER NOT NULL, PRIMARY KEY(conversa_id,dia))`.split(';')) await db.query(sql); },
  async registrar(conversa:string,evento:unknown) {await db.query('INSERT INTO registros(conversa_id,evento) VALUES ($1,$2::jsonb)',[conversa,JSON.stringify(evento)]);},
  async preparar(conversa:string,dados:unknown) {await db.query('INSERT INTO confirmacoes(conversa_id,dados) VALUES ($1,$2::jsonb) ON CONFLICT(conversa_id) DO UPDATE SET dados=EXCLUDED.dados, criado_em=now()',[conversa,JSON.stringify(dados)]);},
  async consumir(conversa:string) {const r=await db.query("DELETE FROM confirmacoes WHERE conversa_id=$1 AND criado_em > now() - interval '15 minutes' RETURNING dados",[conversa]); return r.rows[0]?.dados ?? null;},
  async consumirUso(conversa:string,limite:number) {if(!Number.isSafeInteger(limite)||limite<1) throw new Error('Limite inválido'); const r=await db.query('INSERT INTO uso(conversa_id,quantidade) VALUES ($1,1) ON CONFLICT(conversa_id,dia) DO UPDATE SET quantidade=uso.quantidade+1 WHERE uso.quantidade < $2 RETURNING quantidade',[conversa,limite]); return r.rows.length>0;}
 };
}
