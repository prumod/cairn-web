export function PrivacyPage() {
  return (
    <section>
      <h1>Política de privacidade</h1>
      <h2>Dados de início de sessão</h2>
      <p>
        O Cairn usa o Better Auth com o Google para iniciar sessão. Os registos de autenticação
        incluem um identificador de utilizador, o ID da conta Google, o nome, o endereço de e-mail e
        uma imagem de perfil, quando disponível.
      </p>
      <p>
        A sessão é mantida por cookies. Os registos de sessão incluem uma data de validade e podem
        incluir o endereço IP e o agente do utilizador.
      </p>
      <h2>Perfil e aprovação de acesso</h2>
      <p>
        Utilizadores aprovados podem guardar um perfil da empresa com nome, morada e raio de
        pesquisa em quilómetros.
      </p>
      <p>
        O Cairn guarda o estado de aprovação e a indicação de administrador de cada conta. O acesso
        aos dados do perfil depende do estado de aprovação; um administrador pode aprovar ou revogar
        o acesso.
      </p>
      <h2>Armazenamento</h2>
      <p>
        O código guarda os registos de autenticação, sessão, aprovação e perfil numa base de dados
        PostgreSQL através do cliente Neon HTTP. A aplicação corre num Cloudflare Worker e liga-se à
        base de dados configurada.
      </p>
    </section>
  );
}
