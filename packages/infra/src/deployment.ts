export function deploymentConfig(stage: string, dev: boolean, revision?: string) {
  if (dev) {
    if (stage !== "dev") throw new Error("Local development stage must be dev");

    return {
      domain: undefined,
      workersDev: undefined,
      managed: false,
      appEnv: "development" as const,
      revision: "local",
    };
  }

  if (stage !== "testing" && stage !== "production") {
    throw new Error("Deployment stage must be testing or production");
  }

  if (revision === undefined || !/^[a-f0-9]{40}$/.test(revision)) {
    throw new Error("GIT_SHA must be a full 40-character lowercase hexadecimal commit SHA");
  }

  return {
    domain: stage === "production" ? "cairn.prumod.eu" : "cairn-testing.prumod.eu",
    // Alchemy defaults workersDev to true, which would also serve the Worker (and per-version
    // previews) on workers.dev. Cloud stages are reachable only through their custom domain.
    workersDev: false,
    // Cloud stages own their database and auth secret; local development reads them from the
    // environment.
    managed: true,
    appEnv: "production" as const,
    revision,
  };
}
