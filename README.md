# GitHub Secret Manager

A Node.js library for managing GitHub repository, environment, and Dependabot secrets via the GitHub REST API.

## Features

- Create or update repository secrets
- Create or update Dependabot secrets
- Create or update environment secrets
- Written in TypeScript, supports ESM

## Installation

```sh
npm install github-secret-manager
# or
yarn add github-secret-manager
```

## Requirements

- Node.js v18 or newer (ES2022+)
- A GitHub Personal Access Token with appropriate permissions

## Usage

```typescript
import { SecretManager } from "github-secret-manager";

const manager = new SecretManager("<your-personal-access-token>");

// Create or update a repository secret
await manager.createRepoSecret("owner", "repo", "SECRET_NAME", "secret-value");

// Create or update a Dependabot secret
await manager.createDependabotRepoSecret(
  "owner",
  "repo",
  "SECRET_NAME",
  "secret-value",
);

// Create or update an environment secret
await manager.createEnvironmentSecret(
  "owner",
  "repo",
  "SECRET_NAME",
  "secret-value",
  "environment-name",
);
```

## API

### `new SecretManager(token)`

Creates a new SecretManager instance.

- `token` — GitHub Personal Access Token

### `createRepoSecret(owner, repo, secretName, secretValue)`

Creates or updates a repository Actions secret.

- `owner` — Repository owner (user or org)
- `repo` — Repository name
- `secretName` — Name of the secret
- `secretValue` — Value of the secret

### `createDependabotRepoSecret(owner, repo, secretName, secretValue)`

Creates or updates a repository Dependabot secret.

- Parameters as above.

### `createEnvironmentSecret(owner, repo, secretName, secretValue, environmentName)`

Creates or updates an environment secret.

- `environmentName` — Name of the environment

## Authentication

You must provide a GitHub Personal Access Token (PAT) with the following permissions.

### Fine-grained PAT

Grant **Read and Write** access to these repository permissions:

- **Actions** (for Actions secrets)
- **Administration** (for creating environment)
- **Dependabot secrets** (for Dependabot secrets)
- **Environments** (for environment secrets)
- **Secrets** (for repository secrets)
- **Metadata** (Read-only, always included)

### Classic PAT

Grant the following scopes:

- `repo` (for private repositories)
- `workflow` (for Actions secrets)
- `secrets` (for repository secrets)
- `dependabot_secrets` (for Dependabot secrets)
- `environments` (for environment secrets)
- `admin:repo` (for repository administration, including creating environments)

## License

MIT

## Author

[bryxli](https://github.com/bryxli)

## Status

[![Publish Status](https://github.com/bryxli/github-secret-manager/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/bryxli/github-secret-manager/actions/workflows/npm-publish.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bryxli_github-secret-manager&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=bryxli_github-secret-manager)
