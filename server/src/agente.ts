export type Call = {
  id: string;
  function: { name: string; arguments: string };
};
export type Mensagem = {
  role: string;
  content?: string | null;
  tool_calls?: Call[];
  tool_call_id?: string;
};
export type Modelo = {
  responder: (
    mensagens: Mensagem[],
  ) => Promise<{ content?: string | null; tool_calls?: Call[] }>;
};
export type Ferramentas = Record<
  string,
  (args: Record<string, unknown>) => Promise<unknown>
>;
export type Entrada = {
  mensagem: string;
  modelo: Modelo;
  ferramentas: Ferramentas;
  registrar: (evento: unknown) => Promise<void>;
  historico?: Mensagem[];
  maxPassos?: number;
  conversaId?: string;
  registros?: {
    preparar: (id: string, dados: unknown) => Promise<void>;
    consumir: (id: string) => Promise<Record<string, unknown> | null>;
    consumirUso: (id: string, limite: number) => Promise<boolean>;
    obterColeta?: (id: string) => Promise<Record<string, unknown> | null>;
    salvarColeta?: (id: string, dados: unknown) => Promise<void>;
    limparColeta?: (id: string) => Promise<void>;
  };
  limiteDiario?: number;
};
const campos = ["filial", "sistema", "erro", "desde"] as const;
export async function executar({
  mensagem,
  modelo,
  ferramentas,
  registrar,
  historico = [],
  maxPassos = 6,
  conversaId,
  registros,
  limiteDiario = 30,
}: Entrada): Promise<string> {
  if (
    typeof mensagem !== "string" ||
    !mensagem.trim() ||
    mensagem.length > 2000
  )
    throw new Error("Mensagem inválida");
  const inicio = Date.now();
  const mensagens: Mensagem[] = [
    ...historico,
    { role: "user", content: mensagem },
  ];
  await registrar({ tipo: "mensagem", papel: "usuario", conteudo: mensagem });
  if (registros && conversaId) {
    if (!(await registros.consumirUso(conversaId, limiteDiario)))
      return "Limite diário atingido. Procure um atendente.";
    const coleta = await registros.obterColeta?.(conversaId);
    if (coleta) {
      const proximo = campos.find((c) => !coleta[c]);
      if (proximo) coleta[proximo] = mensagem.trim().slice(0, 500);
      const faltante = campos.find((c) => !coleta[c]);
      if (faltante) {
        await registros.salvarColeta?.(conversaId, coleta);
        return `Informe ${faltante}.`;
      }
      await registros.limparColeta?.(conversaId);
      await registros.preparar(conversaId, coleta);
      const resumo = `Resumo: filial ${coleta.filial}; sistema ${coleta.sistema}; erro ${coleta.erro}; desde ${coleta.desde}. Você confirma a abertura do chamado?`;
      await registrar({
        tipo: "mensagem",
        papel: "assistente",
        conteudo: resumo,
      });
      return resumo;
    }
    if (/^sim[.!]?$/i.test(mensagem.trim())) {
      const dados = await registros.consumir(conversaId);
      if (dados) {
        const resultado = await ferramentas.abrirChamado(dados);
        await registrar({
          tipo: "ferramenta",
          nome: "abrirChamado",
          argumentos: dados,
          resultado,
          duracao_ms: Date.now() - inicio,
        });
        const texto = `Chamado aberto: ${JSON.stringify(resultado)}`;
        await registrar({
          tipo: "mensagem",
          papel: "assistente",
          conteudo: texto,
          duracao_ms: Date.now() - inicio,
        });
        return texto;
      }
    } else {
      await registros.consumir(conversaId);
    }
  }
  for (let passo = 0; passo < Math.min(Math.max(maxPassos, 1), 10); passo++) {
    const resposta = await modelo.responder(mensagens);
    mensagens.push({ role: "assistant", ...resposta });
    if (!resposta.tool_calls?.length) {
      const texto =
        resposta.content || "Não foi possível responder. Procure um atendente.";
      await registrar({
        tipo: "mensagem",
        papel: "assistente",
        conteudo: texto,
        duracao_ms: Date.now() - inicio,
      });
      return texto;
    }
    for (const chamada of resposta.tool_calls) {
      let args: Record<string, unknown>;
      try {
        const parsed: unknown = JSON.parse(chamada.function.arguments);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
          throw 0;
        args = parsed as Record<string, unknown>;
      } catch {
        throw new Error("Argumentos inválidos");
      }
      const nome = chamada.function.name;
      if (!Object.hasOwn(ferramentas, nome))
        throw new Error("Ferramenta desconhecida");
      if (nome === "abrirChamado") {
        const faltam = campos.filter(
          (c) =>
            typeof args[c] !== "string" ||
            !(args[c] as string).trim() ||
            (args[c] as string).length > 500,
        );
        if (faltam.length) {
          if (registros?.salvarColeta && conversaId) {
            const parciais = Object.fromEntries(
              campos
                .filter((c) => !faltam.includes(c))
                .map((c) => [c, args[c]]),
            );
            await registros.salvarColeta(conversaId, parciais);
            return `Informe ${faltam[0]}.`;
          }
          return `Informe: ${faltam.join(", ")}.`;
        }
        if (registros && conversaId)
          await registros.preparar(
            conversaId,
            Object.fromEntries(campos.map((c) => [c, args[c]])),
          );
        const texto = `Resumo: filial ${args.filial}; sistema ${args.sistema}; erro ${args.erro}; desde ${args.desde}. Você confirma a abertura do chamado?`;
        await registrar({
          tipo: "mensagem",
          papel: "assistente",
          conteudo: texto,
          duracao_ms: Date.now() - inicio,
        });
        return texto;
      }
      const resultado = await ferramentas[nome](args);
      await registrar({
        tipo: "ferramenta",
        nome,
        argumentos: args,
        resultado,
        duracao_ms: Date.now() - inicio,
      });
      mensagens.push({
        role: "tool",
        tool_call_id: chamada.id,
        content: JSON.stringify(resultado),
      });
    }
  }
  return "Limite de etapas atingido. Procure um atendente.";
}
