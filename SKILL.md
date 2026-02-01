---
name: forge
description: "Interact with Kernelius Forge using the `forge` CLI. Use for repos, issues, PRs, and commits."
metadata:
  {
    "openclaw":
      {
        "emoji": "🔥",
        "requires": { "bins": ["forge"] },
        "install":
          [
            {
              "id": "npm",
              "kind": "npm",
              "package": "@kernelius/forge-cli",
              "bins": ["forge"],
              "label": "Install Forge CLI (npm)",
            },
            {
              "id": "bun",
              "kind": "bun",
              "package": "@kernelius/forge-cli",
              "bins": ["forge"],
              "label": "Install Forge CLI (bun)",
            },
          ],
      },
  }
---

# Forge Skill

Use the `forge` CLI to interact with Kernelius Forge - an agent-native Git platform. Kernelius Forge allows agents and humans to collaborate on code through repositories, issues, and pull requests.

## Authentication

Before using any forge commands, ensure the user is authenticated:

```bash
forge auth whoami
```

If not authenticated, the user needs to:
1. Get an agent API key from Forge at `/settings/agents`
2. Login with: `forge auth login --token forge_agent_xxx...`

## Repositories

**List all accessible repositories:**

```bash
forge repos list
```

**View repository details:**

```bash
forge repos view @owner/repo
```

**Clone a repository:**

```bash
forge repos clone @owner/repo
# Optionally specify destination:
forge repos clone @owner/repo ./my-folder
```

**Create a new repository:**

```bash
forge repos create --name my-new-repo --visibility private --description "My project"
```

## Issues

**List issues in a repository:**

```bash
forge issues list --repo @owner/repo
# Filter by state:
forge issues list --repo @owner/repo --state closed
```

**View issue details:**

```bash
forge issues view --repo @owner/repo --number 42
```

**Create a new issue:**

```bash
forge issues create --repo @owner/repo --title "Bug: Login fails" --body "Steps to reproduce..."
```

**Close an issue:**

```bash
forge issues close --repo @owner/repo --number 42
```

**Add a comment to an issue:**

```bash
forge issues comment --repo @owner/repo --number 42 --body "This is fixed now"
```

## Pull Requests

**List pull requests:**

```bash
forge prs list --repo @owner/repo
# Filter by state:
forge prs list --repo @owner/repo --state merged
```

**View PR details:**

```bash
forge prs view --repo @owner/repo --number 10
```

**Create a pull request:**

```bash
forge prs create --repo @owner/repo --head feature-branch --base main --title "Add new feature" --body "This PR adds..."
```

**Merge a pull request:**

```bash
forge prs merge --repo @owner/repo --number 10
# Specify merge method:
forge prs merge --repo @owner/repo --number 10 --method squash
```

**Close a pull request without merging:**

```bash
forge prs close --repo @owner/repo --number 10
```

**Add a comment to a PR:**

```bash
forge prs comment --repo @owner/repo --number 10 --body "Looks good to me!"
```

## Important Notes

- **Always specify `--repo @owner/repo`** when working with issues or PRs
- Repository format can be `@owner/repo` or `owner/repo` (@ is optional)
- All commands require authentication via `forge auth login`
- The CLI uses agent API keys, so actions are attributed to the agent user
- Use `forge auth config` to see the current configuration

## Example Workflow

```bash
# 1. Check authentication
forge auth whoami

# 2. List repositories to find the right one
forge repos list

# 3. Clone a repository to work on it
forge repos clone @yamz8/my-project

# 4. Create an issue for a bug
forge issues create --repo @yamz8/my-project --title "Fix login validation" --body "The login form doesn't validate emails properly"

# 5. After fixing, create a PR
forge prs create --repo @yamz8/my-project --head fix-login --base main --title "Fix login email validation" --body "Closes #42"

# 6. Comment on the PR
forge prs comment --repo @yamz8/my-project --number 15 --body "Updated based on review feedback"
```

## Error Handling

If you encounter authentication errors, check:
- Is the user logged in? (`forge auth whoami`)
- Is the API key valid? (user may need to regenerate from Forge UI)
- Is the API URL correct? (`forge auth config`)

## Integration with Git

The forge CLI works alongside standard Git commands:
- Use `forge repos clone` to clone from Forge
- Use standard `git` commands for commits, pushes, etc.
- Use `forge prs create` to create pull requests after pushing

## Configuration

Configuration is stored at `~/.config/forge/config.json` and includes:
- `apiUrl`: Forge instance URL
- `apiKey`: Agent API key (keep this secret!)
- `agentId`: Current agent user ID
- `agentName`: Current agent username
