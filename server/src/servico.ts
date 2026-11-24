import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import { executar, type Mensagem } from "./agente.js";
import {
  criarFerramentasReais,
  criarFerramentasSimuladas,
} from "./ferramentas.js";
import { criarModelo } from "./modelo.js";
import { criarRegistros } from "./registros.js";

type Sessao = {
  conversaId: string;
  ragConversaId: string;
  usuarioId: string;
  token: string;
  historico?: Mensagem[];
};
type Config = {
  baseUrl: string;
  apiKey: string;
  model: string;
  databaseUrl: string;
  ragUrl: string;
  ragKey: string;
  helpdeskUrl: string;
  helpdeskKey: string;
  categoriaId: number;
  simulado: boolean;
  precoEntrada?: number;
  precoSaida?: number;
};
/** A identidade deve vir de uma camada autenticada e nunca de texto produzido pelo modelo. */
export async function criarServico(c: Config) {
  const pool = new Pool({ connectionString: c.databaseUrl });
  const registros = criarRegistros(pool);
  await registros.iniciar();
  const sistema = await readFile(
    new URL("../server/src/prompts/sistema.md", import.meta.url),
    "utf8",
  );
  return {
    async responder(mensagem: string, sessao: Sessao) {
      if (
        !sessao.conversaId ||
        !sessao.usuarioId ||
        !sessao.token ||
        !sessao.ragConversaId
      )
        throw new Error("Sessão inválida");
      const registrar = (evento: unknown) =>
        registros.registrar(sessao.conversaId, evento);
      const modelo = criarModelo({
        baseUrl: c.baseUrl,
        apiKey: c.apiKey,
        model: c.model,
        sistema,
        registrarUso: async (uso: any) => {
          const u = uso.uso;
          const custo =
            u && c.precoEntrada !== undefined && c.precoSaida !== undefined
              ? (u.prompt_tokens * c.precoEntrada +
                  u.completion_tokens * c.precoSaida) /
                1_000_000
              : null;
          await registrar({ ...uso, custo });
        },
      });
      const ferramentas = c.simulado
        ? criarFerramentasSimuladas()
        : criarFerramentasReais({
            ragUrl: c.ragUrl,
            ragKey: c.ragKey,
            helpdeskUrl: c.helpdeskUrl,
            helpdeskKey: c.helpdeskKey,
            token: sessao.token,
            conversaId: sessao.ragConversaId,
            usuarioId: sessao.usuarioId,
            categoriaId: c.categoriaId,
          });
      ferramentas.escalarHumano = async (args) => {
        if (
          typeof args.motivo !== "string" ||
          !args.motivo.trim() ||
          args.motivo.length > 500
        )
          throw new Error("Motivo inválido");
        const id = await registros.escalar(
          sessao.conversaId,
          args.motivo.trim(),
        );
        return { encaminhado: true, protocolo: id, status: "pendente" } as any;
      };
      return executar({
        mensagem,
        modelo,
        ferramentas,
        registrar,
        registros,
        conversaId: sessao.conversaId,
        historico:
          sessao.historico ?? (await registros.historico(sessao.conversaId)),
      });
    },
    /** Encaminhamento direto pedido pelo usuário autenticado, sem passar pelo modelo. */
    async escalar(
      motivo: string,
      sessao: { usuarioId: string; conversaId: string },
    ) {
      if (!sessao.usuarioId || !sessao.conversaId || !motivo.trim())
        throw new Error("Sessão inválida");
      const id = String(await registros.escalar(sessao.conversaId, motivo));
      await registros.registrar(sessao.conversaId, {
        ferramenta: "escalarHumano",
        origem: "botao",
        protocolo: id,
      });
      return id;
    },
    async fechar() {
      await pool.end();
    },
  };
}
