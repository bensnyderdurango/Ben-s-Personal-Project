# Cortex demo: sample repositories

Three small services to import into Cortex as catalog entities through the
GitHub integration.

| Repo | Stack | What it does | Depends on |
|------|-------|--------------|------------|
| `payments-service` | Python / Flask | Create and look up payments | – |
| `user-service` | Node / Express | CRUD for user profiles | – |
| `web-frontend` | Static HTML/JS | Status page that calls both APIs | `user-service`, `payments-service` |

Each repo contains:

- working code with unit tests and a GitHub Actions CI workflow
- `cortex.yaml`, the Cortex entity descriptor (tag, type, groups, the linked
  GitHub repository, and dependencies for `web-frontend`)
- `.github/CODEOWNERS`
- one sample pull request (defined in `_pull-requests/<repo>/`)

## 1. Create the repos on GitHub

With the [GitHub CLI](https://cli.github.com/) installed and `gh auth login` done:

```bash
cd sample-repos
./create-sample-repos.sh            # add VISIBILITY=private for private repos
```

This creates `payments-service`, `user-service` and `web-frontend` under your
account, pushes `main`, and opens a PR from `feature/sample-change` in each.

## 2. Connect GitHub to Cortex

In Cortex, go to **Settings → Integrations → GitHub** and install the Cortex
GitHub App. Give it access to the three repos (or to all repositories).

## 3. Import the repos as entities

Open **Catalogs → All entities → Import entities**, choose **GitHub**, select the
three repos and import them. Because each repo has a `cortex.yaml` at its root,
Cortex can also create or update the entities through GitOps on every push to
`main`.

## 4. Check the result

For each entity, confirm:

- the tag matches the repo (`payments-service`, `user-service`, `web-frontend`)
- the **Git** section links to `github.com/<you>/<repo>` and shows recent commits
- the open pull request shows up in the entity's Git / PR view
- `web-frontend` lists `user-service` and `payments-service` as dependencies
- all three appear in the `demo` group
