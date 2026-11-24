type Dependencias = {
  autenticar: (token: string) => Promise<{ id: string } | null>;
  responder: (
    mensagem: string,
    sessao: {
      usuarioId: string;
      token: string;
      conversaId: string;
      ragConversaId: string;
    },
  ) => Promise<string>;
  escalar?: (
    motivo: string,
    sessao: { usuarioId: string; conversaId: string },
  ) => Promise<string>;
};
export function criarAplicacao(deps: Dependencias) {
  return async (req: Request): Promise<Response> => {
    if (new URL(req.url).pathname !== "/chat" || req.method !== "POST")
      return new Response("Não encontrado", { status: 404 });
    const autorizacao = req.headers.get("authorization");
    if (!autorizacao?.startsWith("Bearer ") || autorizacao.length > 8192)
      return new Response("Não autorizado", { status: 401 });
    const token = autorizacao.slice(7);
    let usuario: { id: string } | null;
    try {
      usuario = await deps.autenticar(token);
    } catch {
      return new Response("Não autorizado", { status: 401 });
    }
    if (!usuario) return new Response("Não autorizado", { status: 401 });
    try {
      const bodyText = await req.text();
      if (bodyText.length > 5000)
        return new Response("Entrada inválida", { status: 400 });
      const body: unknown = JSON.parse(bodyText);
      if (!body || typeof body !== "object" || Array.isArray(body))
        return new Response("Entrada inválida", { status: 400 });
      const b = body as Record<string, unknown>;
      if (
        Object.keys(b).some(
          (k) =>
            !["mensagem", "conversaId", "ragConversaId", "acao"].includes(k),
        ) ||
        typeof b.mensagem !== "string" ||
        !b.mensagem.trim() ||
        b.mensagem.length > 2000 ||
        typeof b.conversaId !== "string" ||
        !/^[\w-]{1,100}$/.test(b.conversaId) ||
        typeof b.ragConversaId !== "string" ||
        !/^[\w-]{1,100}$/.test(b.ragConversaId)
      )
        return new Response("Entrada inválida", { status: 400 });
      if (b.acao !== undefined && b.acao !== "escalar")
        return new Response("Entrada inválida", { status: 400 });
      if (b.acao === "escalar") {
        if (!deps.escalar || b.mensagem.length > 500)
          return new Response("Entrada inválida", { status: 400 });
        const protocolo = await deps.escalar(b.mensagem.trim(), {
          usuarioId: usuario.id,
          conversaId: `${usuario.id}:${b.conversaId}`,
        });
        return Response.json(
          { resposta: "Pedido encaminhado a um atendente.", protocolo },
          {
            headers: {
              "Cache-Control": "no-store",
              "X-Content-Type-Options": "nosniff",
            },
          },
        );
      }
      const resposta = await deps.responder(b.mensagem, {
        usuarioId: usuario.id,
        token,
        conversaId: `${usuario.id}:${b.conversaId}`,
        ragConversaId: b.ragConversaId,
      });
      return Response.json(
        { resposta },
        {
          headers: {
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    } catch {
      return new Response("Não foi possível responder", { status: 500 });
    }
  };
}
export function autenticador(url: string, chave: string, fetcher = fetch) {
  return async (token: string) => {
    const r = await fetcher(`${url.replace(/\/$/, "")}/user`, {
      headers: { apikey: chave, Authorization: `Bearer ${token}` },
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return null;
    const usuario = (await r.json()) as { id?: unknown };
    return typeof usuario.id === "string" && /^[0-9a-f-]{36}$/i.test(usuario.id)
      ? { id: usuario.id }
      : null;
  };
}
