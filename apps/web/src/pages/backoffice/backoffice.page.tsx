import { useEffect, useState } from "react";
import { z } from "zod";
import { put, request } from "../../shared/api/client";

const UserAccess = z.object({
  id: z.string(),
  email: z.string(),
  approved: z.boolean(),
  administrator: z.boolean(),
});

type UserAccess = z.infer<typeof UserAccess>;

const UserAccessList = z.array(UserAccess);

const ApprovalChange = z.object({ approved: z.boolean() });

export function BackofficePage() {
  const [users, setUsers] = useState<UserAccess[]>();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  useEffect(() => {
    request("/api/users", UserAccessList)
      .then(setUsers)
      .catch(() =>
        setError(
          "Não foi possível carregar os acessos. Confirme que é administrador e atualize a página.",
        ),
      );
  }, []);

  async function change(user: UserAccess) {
    setSaving(user.id);
    setError("");

    try {
      await put("/api/users/" + encodeURIComponent(user.id) + "/access", ApprovalChange, {
        approved: !user.approved,
      });
      setUsers(await request("/api/users", UserAccessList));
    } catch {
      setError("Não foi possível alterar o acesso. Tente novamente.");
    }

    setSaving(null);
  }

  return (
    <section>
      <h1>Gerir acessos</h1>
      <p>Aprove ou revogue o acesso aos dados da empresa.</p>
      {error && <p role="alert">{error}</p>}
      {users === undefined && !error && <p>A carregar…</p>}
      {users && (
        <table>
          <caption>Utilizadores que iniciaram sessão</caption>
          <thead>
            <tr>
              <th scope="col">Conta</th>
              <th scope="col">Acesso</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  {user.administrator
                    ? "Administrador"
                    : user.approved
                      ? "Aprovado"
                      : "Sem aprovação"}
                </td>
                <td>
                  {!user.administrator && (
                    <button disabled={saving !== null} onClick={() => change(user)}>
                      {saving === user.id ? "A guardar…" : user.approved ? "Revogar" : "Aprovar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
