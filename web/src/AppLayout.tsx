import { Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { request } from "./shared/api/client.js";

type CurrentUser = { id: string; email: string; approved: boolean; administrator: boolean };

export function AppLayout() {
  const [user, setUser] = useState<CurrentUser | null | undefined>();
  const [error, setError] = useState("");

  useEffect(() => {
    request<CurrentUser | null>("/api/me")
      .then(setUser)
      .catch(() =>
        setError("Não foi possível carregar a sessão. Atualize a página para tentar novamente."),
      );
  }, []);

  async function signIn() {
    setError("");
    try {
      const result = await request<{ url: string }>("/api/auth/sign-in/social", {
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
      await request("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
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
        {user === undefined && !error && <p>A carregar…</p>}
        {user === null ? (
          <section>
            <h1>Entre no Cairn</h1>
            <p>
              Use a sua conta Google. O acesso aos dados da empresa exige aprovação de um
              administrador.
            </p>
            <button onClick={signIn}>Entrar com Google</button>
          </section>
        ) : (
          user && <Outlet />
        )}
      </main>
    </>
  );
}
