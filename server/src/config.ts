type Ambiente = Record<string, string | undefined>;
export function carregarConfig(env: Ambiente = process.env) {
  const obrigatoria = (nome: string) => {
    const valor = env[nome]?.trim();
    if (!valor) throw new Error(`Configuração ausente: ${nome}`);
    return valor;
  };
  const categoriaId = Number(obrigatoria("CATEGORIA_ID"));
  if (!Number.isSafeInteger(categoriaId) || categoriaId < 1)
    throw new Error("CATEGORIA_ID inválido");
  return {
    baseUrl: env.BASE_URL || "https://freellmapi.com/v1",
    apiKey: obrigatoria("API_KEY"),
    model: obrigatoria("MODEL"),
    databaseUrl: obrigatoria("DATABASE_URL"),
    ragUrl: obrigatoria("RAG_URL"),
    ragKey: obrigatoria("RAG_ANON_KEY"),
    helpdeskUrl: obrigatoria("HELPDESK_URL"),
    helpdeskKey: obrigatoria("HELPDESK_ANON_KEY"),
    authUrl: obrigatoria("AUTH_URL"),
    categoriaId,
    simulado: env.FERRAMENTAS_SIMULADAS === "true",
  };
}
