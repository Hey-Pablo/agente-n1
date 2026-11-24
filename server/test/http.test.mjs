import { test } from "node:test";
import assert from "node:assert/strict";
import { criarAplicacao } from "../../dist/http.js";
import { carregarConfig } from "../../dist/config.js";

test("HTTP recusa credenciais inválidas e não chama serviço", async () => {
  let chamadas = 0;
  const app = criarAplicacao({
    autenticar: async () => null,
    responder: async () => {
      chamadas++;
      return "ok";
    },
  });
  const resposta = await app(
    new Request("http://localhost/chat", {
      method: "POST",
      headers: {
        Authorization: "Bearer falso",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mensagem: "oi",
        conversaId: "a",
        ragConversaId: "b",
      }),
    }),
  );
  assert.equal(resposta.status, 401);
  assert.equal(chamadas, 0);
});

test("HTTP usa identidade verificada e rejeita campos extras", async () => {
  let sessao;
  const app = criarAplicacao({
    autenticar: async () => ({ id: "usuario" }),
    responder: async (_m, s) => {
      sessao = s;
      return "ok";
    },
  });
  const req = (body) =>
    new Request("http://localhost/chat", {
      method: "POST",
      headers: {
        Authorization: "Bearer teste",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  assert.equal(
    (
      await app(
        req({
          mensagem: "oi",
          conversaId: "a",
          ragConversaId: "b",
          usuarioId: "outro",
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (await app(req({ mensagem: "oi", conversaId: "a", ragConversaId: "b" })))
      .status,
    200,
  );
  assert.equal(sessao.usuarioId, "usuario");
});

test("configuração exige segredo e usa BASE_URL padrão", () => {
  assert.throws(() => carregarConfig({}));
  const c = carregarConfig({
    API_KEY: "ficticia",
    MODEL: "teste",
    DATABASE_URL: "postgres://teste",
    RAG_URL: "https://rag.test",
    HELPDESK_URL: "https://desk.test",
    RAG_ANON_KEY: "ficticia",
    HELPDESK_ANON_KEY: "ficticia",
    AUTH_URL: "https://auth.test",
    CATEGORIA_ID: "1",
  });
  assert.match(c.baseUrl, /freellmapi/i);
});

test("HTTP escalar chama o encaminhamento direto com a identidade verificada", async () => {
  let chamado;
  let respondeu = 0;
  const app = criarAplicacao({
    autenticar: async () => ({ id: "usuario" }),
    responder: async () => {
      respondeu++;
      return "ok";
    },
    escalar: async (motivo, s) => {
      chamado = { motivo, s };
      return "7";
    },
  });
  const req = (body) =>
    new Request("http://localhost/chat", {
      method: "POST",
      headers: {
        Authorization: "Bearer teste",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  const ok = await app(
    req({
      acao: "escalar",
      mensagem: "Quero um atendente",
      conversaId: "a",
      ragConversaId: "b",
    }),
  );
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).protocolo, "7");
  assert.deepEqual(chamado, {
    motivo: "Quero um atendente",
    s: { usuarioId: "usuario", conversaId: "usuario:a" },
  });
  assert.equal(respondeu, 0);
  const ruim = await app(
    req({ acao: "outra", mensagem: "x", conversaId: "a", ragConversaId: "b" }),
  );
  assert.equal(ruim.status, 400);
});
