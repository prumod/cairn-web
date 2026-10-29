import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { ApiError, put, request } from "../../shared/api/client";
import { track, type EventProperties } from "../../shared/analytics/analytics";

const Profile = z.object({ name: z.string(), address: z.string(), radiusKm: z.number() });

type Profile = z.infer<typeof Profile>;

export function CompanyProfilePage() {
  const [profile, setProfile] = useState<Profile | null | undefined>();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let active = true;
    void track("company_profile_viewed");

    async function load() {
      try {
        const data = await request("/api/company-profile", Profile.nullable());

        if (active) setProfile(data);
      } catch (failure) {
        if (!active) return;

        if (failure instanceof ApiError && failure.status === 403) setPending(true);
        else
          setError(
            failure instanceof Error ? failure.message : "Não foi possível carregar o perfil.",
          );
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    void track("company_profile_save_attempted");
    const form = new FormData(event.currentTarget);

    try {
      const updated = await put("/api/company-profile", Profile, {
        name: form.get("name"),
        address: form.get("address"),
        radiusKm: Number(form.get("radiusKm")),
      });

      setProfile(updated);
      setSaved(true);
      void track("company_profile_save_succeeded");
    } catch (failure) {
      const requestId = failure instanceof ApiError ? failure.requestId : null;
      const properties: EventProperties = {};

      if (failure instanceof ApiError) properties.status = failure.status;

      if (requestId && /^[0-9a-f-]{36}$/.test(requestId)) properties.request_id = requestId;
      void track("company_profile_save_failed", properties);

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
