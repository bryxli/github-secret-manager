import { describe, it, expect, vi, beforeEach } from "vitest";
import { SecretManager } from "../src/index";

vi.mock("@octokit/core", () => {
  return {
    Octokit: vi.fn().mockImplementation(() => ({
      request: vi.fn(async (route: string) => {
        if (route === "GET /repos/{owner}/{repo}") {
          return { data: { id: 0 } };
        }
        if (route === "GET /repos/{owner}/{repo}/actions/secrets/public-key") {
          return { data: { key: "mock-key", key_id: "mock-key-id" } };
        }
        if (
          route === "GET /repos/{owner}/{repo}/dependabot/secrets/public-key"
        ) {
          return { data: { key: "mock-key", key_id: "mock-key-id" } };
        }
        if (
          route ===
          "GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key"
        ) {
          return { data: { key: "mock-key", key_id: "mock-key-id" } };
        }
        if (
          route === "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"
        ) {
          return { status: 201 };
        }
        if (
          route === "PUT /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"
        ) {
          return { status: 201 };
        }
        if (
          route ===
          "PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}"
        ) {
          return { status: 201 };
        }
        return {};
      }),
    })),
  };
});

vi.mock("libsodium-wrappers", () => ({
  __esModule: true,
  default: {
    ready: Promise.resolve(),
    from_base64: vi.fn(() => new Uint8Array([1, 2, 3])),
    from_string: vi.fn(() => new Uint8Array([4, 5, 6])),
    crypto_box_seal: vi.fn(() => new Uint8Array([7, 8, 9])),
    to_base64: vi.fn(() => "encrypted-value"),
    base64_variants: { ORIGINAL: 1 },
  },
}));

describe("SecretManager", () => {
  let manager: SecretManager;

  beforeEach(() => {
    manager = new SecretManager("mock-token");
  });

  it("should create a repository secret", async () => {
    const result = await manager.createRepoSecret(
      "bryxli",
      "github-secret-manager",
      "MY_SECRET",
      "super-secret-value",
    );

    expect(result).toHaveProperty("status", 201);
  });

  it("should create a Dependabot repository secret", async () => {
    const result = await manager.createDependabotRepoSecret(
      "bryxli",
      "github-secret-manager",
      "MY_SECRET",
      "super-secret-value",
    );

    expect(result).toHaveProperty("status", 201);
  });

  it("should create an environment secret", async () => {
    const result = await manager.createEnvironmentSecret(
      "bryxli",
      "github-secret-manager",
      "MY_SECRET",
      "super-secret-value",
      "test",
    );

    expect(result).toHaveProperty("status", 201);
  });
});
