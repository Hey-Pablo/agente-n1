import { createServer } from "node:http";
import { Readable } from "node:stream";
import { carregarConfig } from "./config.js";
import { autenticador, criarAplicacao } from "./http.js";
import { criarServico } from "./servico.js";

const config = carregarConfig();
const servico = await criarServico(config);
const app = criarAplicacao({
  autenticar: autenticador(config.authUrl, config.helpdeskKey),
  responder: servico.responder,
  escalar: servico.escalar,
});
const porta = Number(process.env.PORT ?? 3000);
if (!Number.isSafeInteger(porta) || porta < 1 || porta > 65535)
  throw new Error("PORT inválida");
const servidor = createServer(async (entrada, saida) => {
  try {
    const chunks: Buffer[] = [];
    let tamanho = 0;
    for await (const chunk of entrada) {
      const buffer = Buffer.from(chunk);
      tamanho += buffer.length;
      if (tamanho > 10000) {
        saida.writeHead(413).end();
        return;
      }
      chunks.push(buffer);
    }
    const headers = new Headers();
    for (const [nome, valor] of Object.entries(entrada.headers)) {
      if (Array.isArray(valor)) valor.forEach((v) => headers.append(nome, v));
      else if (valor !== undefined) headers.set(nome, valor);
    }
    const req = new Request(`http://localhost${entrada.url ?? "/"}`, {
      method: entrada.method,
      headers,
      ...(chunks.length ? { body: Buffer.concat(chunks) } : {}),
    });
    const resposta = await app(req);
    saida.writeHead(resposta.status, Object.fromEntries(resposta.headers));
    if (resposta.body) Readable.fromWeb(resposta.body as never).pipe(saida);
    else saida.end();
  } catch {
    saida.writeHead(500).end("Erro interno");
  }
});
servidor.listen(porta, "127.0.0.1");
for (const sinal of ["SIGTERM", "SIGINT"] as const)
  process.on(sinal, () =>
    servidor.close(() => {
      void servico.fechar();
    }),
  );
