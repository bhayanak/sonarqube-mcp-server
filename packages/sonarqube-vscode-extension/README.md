# 🛡️ SonarQube MCP — VS Code Extension

<p align="center">
  <img src="logo.png" alt="SonarQube MCP" width="128" />
</p>

<p align="center">
  <strong>SonarQube MCP server for VS Code AI assistants</strong><br/>
  Integrates directly into VS Code's MCP servers panel with automatic lifecycle controls
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=bhayanak.sonarqube-mcp-extension"><img src="https://img.shields.io/visual-studio-marketplace/v/bhayanak.sonarqube-mcp-extension?color=007acc&label=marketplace" alt="VS Code Marketplace" /></a>
  <a href="https://github.com/bhayanak/sonarqube-mcp-server/blob/main/LICENSE"><img src="https://img.shields.io/github/license/bhayanak/sonarqube-mcp-server?color=blue" alt="license" /></a>
  <img src="https://img.shields.io/badge/vscode-%3E%3D1.99.0-blue" alt="VS Code version" />
</p>

---

## ✨ What It Does

This extension registers a **SonarQube MCP server** directly in VS Code's MCP servers list. Once installed, you get:

- **Automatic start/stop/restart** controls in VS Code's MCP panel
- **12 SonarQube tools** available to GitHub Copilot and other AI assistants
- **Zero manual setup** — just configure your SonarQube URL and token

### 🔧 Available Tools

| Tool | Description |
|------|-------------|
| `sq_list_projects` | List projects with quality status |
| `sq_get_project` | Detailed project overview with metrics |
| `sq_search_issues` | Search bugs, vulnerabilities & code smells |
| `sq_get_issue` | Full issue details with context |
| `sq_get_quality_gate` | Quality gate pass/fail status & conditions |
| `sq_search_hotspots` | Find security hotspots needing review |
| `sq_get_hotspot` | Security hotspot details & remediation |
| `sq_get_measures` | Code quality metrics for any project |
| `sq_get_measures_history` | Track metric trends over time |
| `sq_get_rule` | Rule details & remediation guidance |
| `sq_search_rules` | Search rules by language, type, severity |
| `sq_get_component_tree` | File tree with metrics to find problems |

---

## 📦 Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for **"SonarQube MCP"**
4. Click **Install**

### From VSIX

```bash
code --install-extension sonarqube-mcp-extension-<version>.vsix
```

---

## ⚙️ Configuration

Open VS Code Settings (`Ctrl+,` / `Cmd+,`) and search for **"SonarQube MCP"**:

| Setting | Required | Default | Description |
|---------|----------|---------|-------------|
| `sonarqubeMcp.baseUrl` | ✅ | — | SonarQube/SonarCloud base URL |
| `sonarqubeMcp.token` | ✅ | — | Authentication token |
| `sonarqubeMcp.organization` | ❌ | — | SonarCloud organization key |
| `sonarqubeMcp.defaultProject` | ❌ | — | Default project key |
| `sonarqubeMcp.cacheTtlMs` | ❌ | `300000` | Cache TTL in ms (5 min) |
| `sonarqubeMcp.cacheMaxSize` | ❌ | `100` | Max cached responses |
| `sonarqubeMcp.timeoutMs` | ❌ | `15000` | HTTP request timeout in ms |
| `sonarqubeMcp.pageSize` | ❌ | `100` | Default API page size |

Or add to `settings.json`:

```json
{
  "sonarqubeMcp.baseUrl": "https://sonarcloud.io",
  "sonarqubeMcp.token": "squ_your_token_here",
  "sonarqubeMcp.organization": "my-org"
}
```

---

## 🚀 How It Works

1. Extension activates on VS Code startup
2. Registers an MCP server via `vscode.lm.registerMcpServerDefinitionProvider`
3. VS Code shows **SonarQube MCP** in the MCP servers panel (under Extensions)
4. VS Code manages the server lifecycle — start, stop, restart, show output
5. Settings are passed as environment variables to the bundled MCP server

> **Note**: Requires VS Code ≥ 1.99.0 for the `McpStdioServerDefinition` API.

---

## 🏗️ Development

```bash
# From monorepo root
pnpm install

# Build extension + bundled server
pnpm --filter sonarqube-mcp-extension run build

# Type check
pnpm --filter sonarqube-mcp-extension run typecheck

# Package as VSIX
pnpm --filter sonarqube-mcp-extension run package
```

---

## 📄 License

[MIT](../../LICENSE) © bhayanak

## Commands

- `SonarQube MCP: Start` — Start the MCP server
- `SonarQube MCP: Stop` — Stop the MCP server
- `SonarQube MCP: Status` — Check server status
