# 🛡️ SonarQube MCP Server

<p align="center">
  <img src="packages/sonarqube-vscode-extension/logo.png" alt="SonarQube MCP Server" width="128" />
</p>

<p align="center">
  <strong>Model Context Protocol server for SonarQube</strong><br/>
  Give AI assistants direct access to your code quality, security & analysis data
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/sonarqube-mcp-server"><img src="https://img.shields.io/npm/v/sonarqube-mcp-server?color=cb3837&label=npm" alt="npm" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=bhayanak.sonarqube-mcp-extension"><img src="https://img.shields.io/visual-studio-marketplace/v/bhayanak.sonarqube-mcp-extension?color=007acc&label=vscode" alt="VS Code Marketplace" /></a>
  <a href="https://github.com/bhayanak/sonarqube-mcp-server/blob/main/LICENSE"><img src="https://img.shields.io/github/license/bhayanak/sonarqube-mcp-server?color=blue" alt="license" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="node" />
  <img src="https://img.shields.io/badge/tools-12-orange" alt="tools" />
</p>

---

## 📦 Packages

This monorepo contains two packages:

| Package | Description | Docs |
|---------|-------------|------|
| [`sonarqube-mcp-server`](packages/sonarqube-server/) | Standalone MCP server (npm, CLI, stdio) | [📖 README](packages/sonarqube-server/README.md) |
| [`sonarqube-mcp-extension`](packages/sonarqube-vscode-extension/) | VS Code extension with built-in MCP server | [📖 README](packages/sonarqube-vscode-extension/README.md) |

---

## 🔧 12 Tools at a Glance

| Tool | What it does |
|------|-------------|
| `sq_list_projects` | List projects with quality status |
| `sq_get_project` | Project overview with metrics |
| `sq_search_issues` | Search bugs, vulns & code smells |
| `sq_get_issue` | Full issue details |
| `sq_get_quality_gate` | Quality gate status & conditions |
| `sq_search_hotspots` | Security hotspots needing review |
| `sq_get_hotspot` | Hotspot details & remediation |
| `sq_get_measures` | Code quality metrics |
| `sq_get_measures_history` | Metric trends over time |
| `sq_get_rule` | Rule details & guidance |
| `sq_search_rules` | Search rules by language/type |
| `sq_get_component_tree` | File tree with metrics |

---

## 🚀 Quick Start

### Option 1 — VS Code Extension (Recommended)

1. Install **SonarQube MCP** from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=bhayanak.sonarqube-mcp-extension)
2. Set `sonarqubeMcp.baseUrl` and `sonarqubeMcp.token` in VS Code settings
3. The MCP server appears automatically in VS Code's MCP panel — start/stop/restart from there

→ [Extension docs](packages/sonarqube-vscode-extension/README.md)

### Option 2 — Standalone CLI

```bash
npm install -g sonarqube-mcp-server

export SONAR_MCP_BASE_URL="https://sonarcloud.io"
export SONAR_MCP_TOKEN="squ_your_token"
sonarqube-mcp-server
```

→ [Server docs](packages/sonarqube-server/README.md)

### Option 3 — MCP Client Config (Claude Desktop, Cursor, etc.)

```json
{
  "mcpServers": {
    "sonarqube": {
      "command": "npx",
      "args": ["sonarqube-mcp-server"],
      "env": {
        "SONAR_MCP_BASE_URL": "https://sonarcloud.io",
        "SONAR_MCP_TOKEN": "squ_your_token"
      }
    }
  }
}
```

---

## 📄 License

[MIT](LICENSE) © bhayanak
