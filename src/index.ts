import { Octokit } from "@octokit/core";
import sodium from "libsodium-wrappers";

/**
 * SecretManager provides methods to manage GitHub repository, environment, and Dependabot secrets.
 *
 * ## Usage:
 * ```typescript
 * import { SecretManager } from 'github-secret-manager';
 * const manager = new SecretManager('<your-personal-access-token>');
 *
 * // Create or update a repository secret
 * await manager.createRepoSecret('owner', 'repo', 'SECRET_NAME', 'secret-value');
 *
 * // Create or update a Dependabot secret
 * await manager.createDependabotRepoSecret('owner', 'repo', 'SECRET_NAME', 'secret-value');
 *
 * // Create or update an environment secret
 * await manager.createEnvironmentSecret('owner', 'repo', 'SECRET_NAME', 'secret-value', 'environment-name');
 * ```
 *
 * All methods require a GitHub personal access token with appropriate permissions.
 */
class SecretManager {
  private octokit: Octokit;

  /**
   * Create a new SecretManager instance.
   * @param pat GitHub Personal Access Token
   */
  constructor(pat: string) {
    this.octokit = new Octokit({ auth: pat });
  }

  /**
   * Create or update a repository secret.
   *
   * @param owner Repository owner (user or org)
   * @param repo Repository name
   * @param secretName Name of the secret to create or update
   * @param secretValue Value of the secret
   *
   * @example
   * await manager.createRepoSecret('bryxli', 'github-secret-manager', 'MY_SECRET', 'super-secret-value');
   */
  async createRepoSecret(
    owner: string,
    repo: string,
    secretName: string,
    secretValue: string,
  ) {
    const publicKey = await this.getPublicKey(owner, repo);
    const encryptedValue = await this.encrypt(publicKey.data.key, secretValue);

    await this.octokit.request(
      "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}",
      {
        owner: owner,
        repo: repo,
        secret_name: secretName,
        encrypted_value: encryptedValue,
        key_id: publicKey.data.key_id,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
  }

  /**
   * Create or update a Dependabot repository secret.
   *
   * @param owner Repository owner (user or org)
   * @param repo Repository name
   * @param secretName Name of the secret to create or update
   * @param secretValue Value of the secret
   *
   * @example
   * await manager.createDependabotRepoSecret('bryxli', 'github-secret-manager', 'MY_SECRET', 'super-secret-value');
   */
  async createDependabotRepoSecret(
    owner: string,
    repo: string,
    secretName: string,
    secretValue: string,
  ) {
    const publicKey = await this.getDependabotPublicKey(owner, repo);
    const encryptedValue = await this.encrypt(publicKey.data.key, secretValue);

    await this.octokit.request(
      "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}",
      {
        owner,
        repo,
        secret_name: secretName,
        encrypted_value: encryptedValue,
        key_id: publicKey.data.key_id,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
  }

  /**
   * Create or update an environment secret.
   *
   * @param owner Repository owner (user or org)
   * @param repo Repository name
   * @param secretName Name of the secret to create or update
   * @param secretValue Value of the secret
   * @param environmentName Name of the environment
   *
   * @example
   * await manager.createEnvironmentSecret('bryxli', 'github-secret-manager', 'MY_SECRET', 'super-secret-value', 'production');
   */
  async createEnvironmentSecret(
    owner: string,
    repo: string,
    secretName: string,
    secretValue: string,
    environmentName: string,
  ) {
    const repoId = (await this.getRepo(owner, repo)).data.id;
    const publicKey = await this.getEnvPublicKey(repoId, environmentName);
    const encryptedValue = await this.encrypt(publicKey.data.key, secretValue);

    await this.createEnvironment(owner, repo, environmentName);

    await this.octokit.request(
      "PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}",
      {
        owner,
        repo,
        secret_name: secretName,
        encrypted_value: encryptedValue,
        key_id: publicKey.data.key_id,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
  }

  private async getRepo(owner: string, repo: string) {
    return await this.octokit.request("GET /repos/{owner}/{repo}", {
      owner: owner,
      repo: repo,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  }

  private async getPublicKey(owner: string, repo: string) {
    return await this.octokit.request(
      "GET /repos/{owner}/{repo}/actions/secrets/public-key",
      {
        owner: owner,
        repo: repo,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
  }

  private async getDependabotPublicKey(owner: string, repo: string) {
    return await this.octokit.request(
      "GET /repos/{owner}/{repo}/dependabot/secrets/public-key",
      {
        owner: owner,
        repo: repo,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
  }

  private async getEnvPublicKey(repoId: number, environmentName: string) {
    return await this.octokit.request(
      "GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key",
      {
        repository_id: repoId,
        environment_name: environmentName,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
  }

  private async createEnvironment(
    owner: string,
    repo: string,
    environmentName: string,
  ) {
    await this.octokit.request(
      "PUT /repos/{owner}/{repo}/environments/{environment_name}",
      {
        owner,
        repo,
        environment_name: environmentName,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
  }

  private async encrypt(key: string, secret: string): Promise<string> {
    await sodium.ready;
    const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
    const binsec = sodium.from_string(secret);
    const encBytes = sodium.crypto_box_seal(binsec, binkey);
    return sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
  }
}

export { SecretManager };
