# 🛡️ SonarQube MCP Server

<p align="center">
  <img src="../../packages/sonarqube-vscode-extension/logo.png" alt="SonarQube MCP Server" width="128" />
</p>

<p align="center">
  <strong>Model Context Protocol server for SonarQube</strong><br/>
  Give AI assistants direct access to your code quality & security data
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/sonarqube-mcp-server"><img src="https://img.shields.io/npm/v/sonarqube-mcp-server?color=cb3837&label=npm" alt="npm version" /></a>
  <a href="https://github.com/bhayanak/sonarqube-mcp-server/blob/main/LICENSE"><img src="https://img.shields.io/github/license/bhayanak/sonarqube-mcp-server?color=blue" alt="license" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="node version" />
</p>

---

## ✨ Features

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

### 🔧 Built-in Capabilities

- **LRU caching** with configurable TTL and size limits
- **Bearer token** authentication
- **Zod schema** validation on all tool inputs
- **Rich formatted output** — severity icons, progress bars, sparklines
- **SonarCloud support** — optional organization parameter
- **Configurable timeouts** and page sizes

---

## 📦 Installation

```bash
npm install -g sonarqube-mcp-server
```

Or use directly with `npx`:

```bash
npx sonarqube-mcp-server
```

---

## ⚙️ Configuration

The server reads configuration from environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SONAR_MCP_BASE_URL` | ✅ | — | SonarQube/SonarCloud base URL |
| `SONAR_MCP_TOKEN` | ✅ | — | Authentication token |
| `SONAR_MCP_ORGANIZATION` | ❌ | — | SonarCloud organization key |
| `SONAR_MCP_DEFAULT_PROJECT` | ❌ | — | Default project key |
| `SONAR_MCP_CACHE_TTL_MS` | ❌ | `300000` | Cache TTL (milliseconds) |
| `SONAR_MCP_CACHE_MAX_SIZE` | ❌ | `100` | Max cached responses |
| `SONAR_MCP_TIMEOUT_MS` | ❌ | `15000` | HTTP request timeout (ms) |
| `SONAR_MCP_PAGE_SIZE` | ❌ | `100` | Default API page size |

### Quick Start

```bash
export SONAR_MCP_BASE_URL="https://sonarcloud.io"
export SONAR_MCP_TOKEN="squ_your_token_here"
sonarqube-mcp-server
```

### MCP Client Configuration

Add to your MCP client config (e.g. Claude Desktop, Cursor):

```json
{
  "mcpServers": {
    "sonarqube": {
      "command": "npx",
      "args": ["sonarqube-mcp-server"],
      "env": {
        "SONAR_MCP_BASE_URL": "https://sonarcloud.io",
        "SONAR_MCP_TOKEN": "squ_your_token_here"
      }
    }
  }
}
```

---

## 📄 License

[MIT](../../LICENSE) © bhayanak

Set environment variables:

| Variable | Required | Description |
|---|---|---|
| `SONAR_MCP_BASE_URL` | Yes | SonarQube server URL |
| `SONAR_MCP_TOKEN` | Yes | Authentication token |
| `SONAR_MCP_ORGANIZATION` | No | SonarCloud organization |
| `SONAR_MCP_DEFAULT_PROJECT` | No | Default project key |
| `SONAR_MCP_CACHE_TTL_MS` | No | Cache TTL (default: 300000) |
| `SONAR_MCP_TIMEOUT_MS` | No | Request timeout (default: 15000) |

## Usage

```bash
SONAR_MCP_BASE_URL=https://sonar.example.com SONAR_MCP_TOKEN=your-token sonarqube-mcp-server
```

## MCP Tools

| Tool | Description |
|---|---|
| `sq_list_projects` | List projects with quality status |
| `sq_get_project` | Get project overview with metrics |
| `sq_search_issues` | Search bugs, vulnerabilities, code smells |
| `sq_get_issue` | Get issue details |
| `sq_get_quality_gate` | Quality gate pass/fail status |
| `sq_search_hotspots` | Search security hotspots |
| `sq_get_hotspot` | Get hotspot details |
| `sq_get_measures` | Get code quality metrics |
| `sq_get_measures_history` | Track metric trends over time |
| `sq_get_rule` | Get rule details and remediation |
| `sq_search_rules` | Search analysis rules |
| `sq_get_component_tree` | File tree with metrics |

## License

MIT
