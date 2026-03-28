# Deployment Guide

## Prerequisites

- Node.js ≥ 18
- pnpm ≥ 10
- npm account at [npmjs.com](https://www.npmjs.com/) (for server)
- VS Code Marketplace publisher at [marketplace.visualstudio.com](https://marketplace.visualstudio.com/manage) (for extension)
- A Personal Access Token (PAT) for the VS Code Marketplace

---

## 1. MCP Server → npmjs

### First-time setup

```bash
npm login
```

### Publish

```bash
cd packages/sonarqube-server

# Build + create tarball
pnpm run package

# Inspect what will be published
npm pack --dry-run

# Publish (public, unscoped)
npm publish --access public
```

### Version bumps

```bash
# Patch release (0.1.0 → 0.1.1)
npm version patch

# Minor release (0.1.1 → 0.2.0)
npm version minor

# Major release (0.2.0 → 1.0.0)
npm version major

# Then publish
npm publish --access public
```

---

## 2. VS Code Extension → Marketplace

### First-time setup

1. Create a publisher at <https://marketplace.visualstudio.com/manage>
2. Create a Personal Access Token (PAT) in Azure DevOps with **Marketplace (Manage)** scope
3. Login with vsce:

```bash
npx @vscode/vsce login <publisher-name>
```

4. Update `publisher` in `packages/sonarqube-vscode-extension/package.json` to match your publisher name.

### Package & Publish

```bash
cd packages/sonarqube-vscode-extension

# Build + create .vsix
pnpm run package

# Verify the .vsix
npx @vscode/vsce ls --packagePath sonarqube-mcp-extension.vsix

# Publish to marketplace
npx @vscode/vsce publish
```

### Version bumps

```bash
# Bump and publish in one step
npx @vscode/vsce publish patch   # 0.1.0 → 0.1.1
npx @vscode/vsce publish minor   # 0.1.1 → 0.2.0
npx @vscode/vsce publish major   # 0.2.0 → 1.0.0
```

---

## 3. CI/CD Automated Releases (optional)

Add these secrets to your GitHub repository settings:

| Secret              | Purpose                         |
| ------------------- | ------------------------------- |
| `NPM_TOKEN`         | npm publish token               |
| `VSCE_PAT`          | VS Code Marketplace PAT         |

Then add a release job to `.github/workflows/ci.yml` triggered on tags:

```yaml
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: https://registry.npmjs.org
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: cd packages/sonarqube-server && npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - run: cd packages/sonarqube-vscode-extension && npx @vscode/vsce package --no-dependencies -o sonarqube-mcp-extension.vsix && npx @vscode/vsce publish --packagePath sonarqube-mcp-extension.vsix
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

### Creating a release

```bash
# Tag and push
git tag v0.1.0
git push origin v0.1.0
```

---

## 4. Pre-publish Checklist

- [ ] All tests pass: `pnpm test:coverage`
- [ ] Lint clean: `pnpm lint`
- [ ] Format clean: `pnpm format`
- [ ] Types clean: `pnpm typecheck`
- [ ] Build succeeds: `pnpm build`
- [ ] Packages created: `pnpm package`
- [ ] Version bumped in both `package.json` files
- [ ] CHANGE.md updated with release notes
- [ ] README.md is current
