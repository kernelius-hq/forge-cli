# Release Checklist - v0.1.3

## Changes in v0.1.3
- Fixed API endpoint alignment for all commands
- `repos list` now uses `/api/repositories/user/:username`
- `issues list` handles `{ issues: [...] }` response format
- `prs` commands use `/pulls` endpoint instead of `/pull-requests`
- `prs merge/close/comment` fetch PR ID before performing actions

## Pre-Publishing Verification

### Build ✅
```bash
npm run build
# ✅ Builds successfully to dist/index.js
```

### Package Contents ✅
```bash
npm pack --dry-run
# ✅ Includes: LICENSE, README.md, SKILL.md, dist/index.js, package.json
```

### Git Tags ✅
```bash
git tag v0.1.3
git push origin v0.1.3
# ✅ Tag created and pushed
```

## Publishing to npm

### Prerequisites
1. Verify npm login:
   ```bash
   npm whoami
   ```
2. Ensure you have publish rights to @kernelius org

### Publish Command
```bash
npm publish --access public
```

### Verify Publication
```bash
npm view @kernelius/forge-cli
```

### Test Installation
```bash
npm install -g @kernelius/forge-cli@0.1.3
forge --version  # Should show 0.1.3
```

## Post-Publishing

### Update Documentation
- [ ] Update Kernelius Forge docs to reference v0.1.3
- [ ] Update OpenClaw integration guide with install instructions

### Announce
- [ ] Post release notes on GitHub releases page
- [ ] Update main README if needed

## Testing Checklist

After publishing, test these commands:

```bash
# Auth
forge auth login --token forge_agent_xxx... --api-url http://localhost:3001
forge auth whoami

# Repos
forge repos list
forge repos view @owner/repo

# Issues
forge issues list --repo @owner/repo
forge issues create --repo @owner/repo --title "Test" --body "Test"

# PRs
forge prs list --repo @owner/repo
forge prs view --repo @owner/repo --number 1
```

## Rollback Plan

If issues are found after publishing:

1. Deprecate the broken version:
   ```bash
   npm deprecate @kernelius/forge-cli@0.1.3 "Broken, use 0.1.4 instead"
   ```

2. Fix issues and publish patch version 0.1.4

## Notes

- This version fixes critical bugs that prevented CLI from working with the API
- Users upgrading from 0.1.2 will need to reinstall: `npm install -g @kernelius/forge-cli@latest`
