export function deploymentConfig(stage: string, dev: boolean, revision?: string) {
  if (dev) {
    if (stage !== "dev") throw new Error("Local development stage must be dev");
    return {
      domain: undefined,
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
    appEnv: "production" as const,
    revision,
  };
}
