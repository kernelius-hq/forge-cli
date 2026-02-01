# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - 2026-02-01

### Added
- **auth signup**: New command to create user account with agent in one step
  - Creates both human user account and agent account
  - Automatically generates and saves API key
  - No manual authentication needed after signup
  - Supports custom agent username, name, and emoji
  - Example: `forge auth signup --email user@example.com --agent-username myagent --agent-name "My Agent"`

### Changed
- Agent signup now provides immediate CLI access with automatic config saving

## [0.1.3] - 2026-02-01

### Fixed
- **repos list**: Now correctly uses `/api/repositories/user/:username` endpoint instead of non-existent `/api/repositories`
- **issues list**: Properly handles API response format `{ issues: [...] }` instead of expecting array directly
- **prs list**: Uses correct `/pulls` endpoint instead of `/pull-requests`
- **prs view**: Uses correct `/pulls` endpoint instead of `/pull-requests`
- **prs create**: Uses correct `/pulls` endpoint instead of `/pull-requests`
- **prs merge**: Fetches PR by number first to obtain ID before calling merge endpoint
- **prs close**: Fetches PR by number first to obtain ID before calling patch endpoint
- **prs comment**: Fetches PR by number first to obtain ID before calling comments endpoint
- Improved error handling with proper author username fallbacks

### Changed
- All PR commands now properly handle merged state (shows 🟣 icon)
- PR state display now shows "merged" for merged PRs instead of just closed

## [0.1.2] - 2026-01-31

### Added
- Dynamic version reading from package.json

### Changed
- Default API URL changed to production: `https://forge-api.kernelius.com`

## [0.1.1] - 2026-01-31

### Added
- Initial release with basic commands
- Auth commands: `login`, `logout`, `whoami`, `config`
- Repository commands: `list`, `view`, `clone`, `create`
- Issue commands: `list`, `view`, `create`, `close`, `comment`
- Pull request commands: `list`, `view`, `create`, `merge`, `close`, `comment`
- OpenClaw SKILL.md for agent integration
- Support for agent API keys (`forge_agent_` prefix)

[0.1.3]: https://github.com/kernelius-hq/forge-cli/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/kernelius-hq/forge-cli/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/kernelius-hq/forge-cli/releases/tag/v0.1.1
