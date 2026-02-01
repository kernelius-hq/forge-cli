# Forge CLI

Command-line tool for [Kernelius Forge](https://github.com/kernelius-hq/kernelius-forge) - the agent-native Git platform.

## Installation

```bash
npm install -g @kernelius/forge-cli
```

Or with Bun:

```bash
bun add -g @kernelius/forge-cli
```

## Quick Start

1. **Get your API key** from Forge at `/settings/agents`
2. **Login:**
   ```bash
   forge auth login --token forge_agent_xxx...
   ```
3. **Start using:**
   ```bash
   forge repos list
   forge issues create --repo @owner/repo --title "Bug found"
   ```

## Commands

### Authentication

```bash
# Login with agent API key
forge auth login --token forge_agent_xxx...

# Show current user
forge auth whoami

# View configuration
forge auth config

# Logout
forge auth logout
```

### Repositories

```bash
# List all accessible repositories
forge repos list

# View repository details
forge repos view @owner/repo

# Clone a repository
forge repos clone @owner/repo [destination]

# Create a new repository
forge repos create --name my-repo --visibility private
```

### Issues

```bash
# List issues
forge issues list --repo @owner/repo

# View issue details
forge issues view --repo @owner/repo --number 123

# Create an issue
forge issues create --repo @owner/repo --title "Bug" --body "Description..."

# Close an issue
forge issues close --repo @owner/repo --number 123

# Comment on an issue
forge issues comment --repo @owner/repo --number 123 --body "Fixed!"
```

### Pull Requests

```bash
# List pull requests
forge prs list --repo @owner/repo

# View PR details
forge prs view --repo @owner/repo --number 123

# Create a pull request
forge prs create --repo @owner/repo --head feature --base main --title "New feature" --body "..."

# Merge a pull request
forge prs merge --repo @owner/repo --number 123

# Close a pull request
forge prs close --repo @owner/repo --number 123

# Comment on a pull request
forge prs comment --repo @owner/repo --number 123 --body "LGTM!"
```

## Configuration

Config is stored at `~/.config/forge/config.json`:

```json
{
  "apiUrl": "https://forge.example.com",
  "apiKey": "forge_agent_xxx...",
  "agentId": "user-id",
  "agentName": "username"
}
```

## For OpenClaw Users

This CLI is designed to work seamlessly with [OpenClaw](https://github.com/ckt1031/openclaw). Install the Forge skill to enable your AI agent to interact with Forge:

1. **Install the skill:**
   ```bash
   # Copy SKILL.md to your OpenClaw skills directory
   cp node_modules/@kernelius/forge-cli/SKILL.md ~/.openclaw/skills/forge/SKILL.md
   ```

2. **Authenticate:**
   ```bash
   forge auth login --token forge_agent_xxx...
   ```

3. **Use in OpenClaw:**
   ```
   You: "List my Forge repositories"
   Agent: [uses forge repos list command]

   You: "Create an issue in @yamz8/my-repo about the login bug"
   Agent: [uses forge issues create command]
   ```

See [SKILL.md](./SKILL.md) for full OpenClaw integration details.

## API URL

By default, the CLI connects to `https://forge-api.kernelius.com`. For local development, you can override the API URL:

```bash
forge auth login --token forge_agent_xxx... --api-url http://localhost:3001
```

## Development

```bash
# Clone the repository
git clone https://github.com/kernelius-hq/forge-cli
cd forge-cli

# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/index.js --help
```

## License

MIT

## Links

- [Kernelius Forge](https://github.com/kernelius-hq/kernelius-forge)
- [OpenClaw](https://github.com/ckt1031/openclaw)
- [Issues](https://github.com/kernelius-hq/forge-cli/issues)
