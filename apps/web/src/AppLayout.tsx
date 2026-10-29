import { useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { request } from "./shared/api/client.js";
import { identify, reset } from "./shared/analytics/analytics.js";

const CurrentUser = z
  .object({ id: z.string(), email: z.string(), approved: z.boolean(), administrator: z.boolean() })
  .nullable();

type CurrentUser = z.infer<typeof CurrentUser>;

const SignInRedirect = z.object({ url: z.string() });

export function AppLayout() {
  const queryClient = useQueryClient();

  const isPublicLegalPage = useRouterState({
    select: (state) =>
      state.location.pathname === "/privacy" || state.location.pathname === "/terms",
  });

  const [user, setUser] = useState<CurrentUser | undefined>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPublicLegalPage) return;
    let active = true;

    request("/api/me", CurrentUser)
      .then((current) => {
        if (!active) return;

        // Session checks are the boundary between authenticated identities.
        queryClient.clear();
        setUser(current);

        if (current) void identify(current.id);
        else void reset();
      })
      .catch(() => {
        if (active) {
          setError("Não foi possível carregar a sessão. Atualize a página para tentar novamente.");
        }
      });

    return () => {
      active = false;
    };
  }, [isPublicLegalPage, queryClient]);

  async function signIn() {
    setError("");

    try {
      const result = await request("/api/auth/sign-in/social", SignInRedirect, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google", callbackURL: window.location.origin }),
      });

      window.location.assign(result.url);
    } catch {
      setError("Não foi possível iniciar sessão. Tente novamente.");
    }
  }

  async function signOut() {
    try {
      await request("/api/auth/sign-out", z.unknown(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      await reset();
      queryClient.clear();
      setUser(null);
      window.location.assign("/");
    } catch {
      setError("Não foi possível terminar a sessão. Tente novamente.");
    }
  }

  return (
    <>
      <header>
        <Link className="brand" to="/">
          Cairn
        </Link>
        {user && (
          <nav aria-label="Navegação">
            <Link to="/">Perfil da empresa</Link>
            {user.administrator && user.approved && <Link to="/access">Gerir acessos</Link>}
            <button onClick={signOut}>Sair</button>
          </nav>
        )}
      </header>
      <main>
        {error && <p role="alert">{error}</p>}
        {isPublicLegalPage ? (
          <Outlet />
        ) : user === undefined && !error ? (
          <p>A carregar…</p>
        ) : user === null ? (
          <section>
            <h1>Entre no Cairn</h1>
            <p>
              Use a sua conta Google. O acesso aos dados da empresa exige aprovação de um
              administrador.
            </p>
            <button onClick={signIn}>Entrar com Google</button>
          </section>
        ) : (
          user && <Outlet key={user.id} />
        )}
      </main>
      <footer>
        <nav aria-label="Informação legal">
          <Link to="/privacy">Política de privacidade</Link>
          <Link to="/terms">Termos de utilização</Link>
        </nav>
      </footer>
    </>
  );
}
