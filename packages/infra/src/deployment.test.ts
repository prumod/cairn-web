import { describe, expect, it } from "vitest";
import { deploymentConfig } from "./deployment";

const revision = "0123456789abcdef0123456789abcdef01234567";

describe("Worker deployment configuration", () => {
  it.each([undefined, "", "local", "1739cec", "A".repeat(40), "a".repeat(39), "a".repeat(41)])(
    "rejects invalid deployed revision %j in both cloud stages",
    (invalidRevision) => {
      for (const stage of ["testing", "production"]) {
        expect(() => deploymentConfig(stage, false, invalidRevision)).toThrow(
          "GIT_SHA must be a full 40-character lowercase hexadecimal commit SHA",
        );
      }
    },
  );
  it.each(["dev", "test", "preview", "", "Production"])(
    "rejects unsupported cloud stage %j instead of selecting a domain",
    (stage) => {
      expect(() => deploymentConfig(stage, false, revision)).toThrow(
        "Deployment stage must be testing or production",
      );
    },
  );

  it.each(["testing", "production", "preview", ""])(
    "rejects local development against stage %j",
    (stage) => {
      expect(() => deploymentConfig(stage, true)).toThrow("Local development stage must be dev");
    },
  );
  it("keeps local development off custom domains and does not require a deployed revision", () => {
    expect(deploymentConfig("dev", true)).toEqual({
      domain: undefined,
      workersDev: undefined,
      managed: false,
      appEnv: "development",
      revision: "local",
    });
  });
  it("uses the production custom domain without changing security or revision", () => {
    expect(deploymentConfig("production", false, revision)).toEqual({
      domain: "cairn.prumod.eu",
      workersDev: false,
      managed: true,
      appEnv: "production",
      revision,
    });
  });
  it("uses the testing custom domain with production security and the exact revision", () => {
    expect(deploymentConfig("testing", false, revision)).toEqual({
      domain: "cairn-testing.prumod.eu",
      workersDev: false,
      managed: true,
      appEnv: "production",
      revision,
    });
  });
  it.each(["testing", "production"])(
    "serves the %s Worker only on its custom domain, never on workers.dev",
    (stage) => {
      expect(deploymentConfig(stage, false, revision).workersDev).toBe(false);
    },
  );
  it.each(["testing", "production"])(
    "lets Alchemy provision the %s database and auth secret instead of reading them from the environment",
    (stage) => {
      expect(deploymentConfig(stage, false, revision).managed).toBe(true);
    },
  );
  it("reads the local development database and auth secret from the environment", () => {
    expect(deploymentConfig("dev", true).managed).toBe(false);
  });
});
