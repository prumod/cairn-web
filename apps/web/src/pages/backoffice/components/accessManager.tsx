import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserAccess } from "../useCases/listUsers/listUsers";

interface AccessManagerProps {
  listUsers(options: { signal: AbortSignal }): Promise<UserAccess[]>;
  changeAccess(options: {
    data: { userId: string; approved: boolean };
  }): Promise<{ approved: boolean }>;
}

export function AccessManager({ listUsers, changeAccess }: AccessManagerProps) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: ({ signal }) => listUsers({ signal }),
    gcTime: 0,
    retry: false,
  });

  const change = useMutation({
    mutationFn: (user: UserAccess) =>
      changeAccess({ data: { userId: user.id, approved: !user.approved } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] }, { throwOnError: true });
    },
  });

  const users = usersQuery.isError ? undefined : usersQuery.data;

  const error = change.isError
    ? "Não foi possível alterar o acesso. Tente novamente."
    : usersQuery.isError
      ? "Não foi possível carregar os acessos. Confirme que é administrador e atualize a página."
      : "";

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
                    <button
                      disabled={change.isPending || usersQuery.isFetching}
                      onClick={() => change.mutate(user)}
                    >
                      {change.isPending && change.variables.id === user.id
                        ? "A guardar…"
                        : user.approved
                          ? "Revogar"
                          : "Aprovar"}
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
