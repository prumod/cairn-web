import { StrictMode, useEffect, useState } from "react";
import { CompanyProfilePage } from "./pages/companyProfile/companyProfile.page";
import { request } from "./shared/api/client";
import { BackofficePage } from "./pages/backoffice/backoffice.page";
import "./style.css";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
if (container === null) throw new Error("The app root element is missing.");

type CurrentUser = { id: string; email: string; approved: boolean; administrator: boolean };

function App() {
  const [user, setUser] = useState<CurrentUser | null | undefined>();
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  useEffect(() => {
    request<CurrentUser | null>("/api/me")
      .then(setUser)
      .catch(() =>
        setError("Não foi possível carregar a sessão. Atualize a página para tentar novamente."),
      );
  }, []);
  async function signIn() {
    setSigningIn(true);
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
      setSigningIn(false);
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
        <a className="brand" href="/">
          Cairn
        </a>
        {user && (
          <nav aria-label="Navegação">
            <a href="/">Perfil da empresa</a>
            {user.administrator && user.approved && <a href="/access">Gerir acessos</a>}
            <button onClick={signOut}>Sair</button>
          </nav>
        )}
      </header>
      <main>
        {error && <p role="alert">{error}</p>}
        {user === undefined && !error && <p>A carregar…</p>}
        {user === null && (
          <section>
            <h1>Entre no Cairn</h1>
            <p>
              Use a sua conta Google. O acesso aos dados da empresa exige aprovação de um
              administrador.
            </p>
            <button disabled={signingIn} onClick={signIn}>
              {signingIn ? "A entrar…" : "Entrar com Google"}
            </button>
          </section>
        )}
        {user &&
          (window.location.pathname === "/access" ? <BackofficePage /> : <CompanyProfilePage />)}
      </main>
    </>
  );
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
