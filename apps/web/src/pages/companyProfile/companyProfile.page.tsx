import { useEffect, useState, type FormEvent } from "react";
import { ApiError, put, request } from "../../shared/api/client";

type Profile = { name: string; address: string; radiusKm: number };
export function CompanyProfilePage() {
  const [profile, setProfile] = useState<Profile | null | undefined>();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let active = true;
    request<Profile | null>("/api/company-profile")
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((failure: unknown) => {
        if (!active) return;
        if (failure instanceof ApiError && failure.status === 403) setPending(true);
        else
          setError(
            failure instanceof Error ? failure.message : "Não foi possível carregar o perfil.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const updated = await put<Profile>("/api/company-profile", {
        name: form.get("name"),
        address: form.get("address"),
        radiusKm: Number(form.get("radiusKm")),
      });
      setProfile(updated);
      setSaved(true);
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 403) setPending(true);
      else
        setError(failure instanceof Error ? failure.message : "Não foi possível guardar o perfil.");
    }
    setSaving(false);
  }
  if (pending)
    return (
      <section>
        <h1>Acesso à empresa</h1>
        <p>A sua conta aguarda aprovação.</p>
      </section>
    );
  if (profile === undefined)
    return (
      <section>
        <h1>Perfil da empresa</h1>
        {error ? (
          <p role="alert">
            {error} <button onClick={() => location.reload()}>Tentar novamente</button>
          </p>
        ) : (
          <p>A carregar…</p>
        )}
      </section>
    );
  return (
    <section>
      <h1>Perfil da empresa</h1>
      <p>
        Guarde a referência da empresa. Estes dados são partilhados com os utilizadores aprovados.
      </p>
      {profile === null && <p>Ainda não foi guardado um perfil.</p>}
      <form onSubmit={save}>
        <label htmlFor="name">Nome da empresa</label>
        <input
          id="name"
          name="name"
          autoComplete="organization"
          required
          maxLength={200}
          defaultValue={profile?.name ?? ""}
        />
        <label htmlFor="address">Morada de referência</label>
        <input
          id="address"
          name="address"
          autoComplete="street-address"
          required
          maxLength={500}
          defaultValue={profile?.address ?? ""}
        />
        <label htmlFor="radiusKm">Raio de pesquisa (km)</label>
        <input
          id="radiusKm"
          name="radiusKm"
          type="number"
          required
          min="0"
          step="any"
          defaultValue={profile?.radiusKm ?? ""}
        />
        <button type="submit" disabled={saving}>
          {saving ? "A guardar…" : "Guardar perfil"}
        </button>
        {error && <p role="alert">{error}</p>}
        <p role="status" aria-live="polite">
          {saved ? "Perfil guardado." : ""}
        </p>
      </form>
    </section>
  );
}
