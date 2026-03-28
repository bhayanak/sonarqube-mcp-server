import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SonarQubeClient } from './api/client.js'
import type { SonarConfig } from './api/types.js'
import { registerProjectTools } from './tools/projects.js'
import { registerIssueTools } from './tools/issues.js'
import { registerQualityGateTools } from './tools/quality-gates.js'
import { registerHotspotTools } from './tools/hotspots.js'
import { registerMeasureTools } from './tools/measures.js'
import { registerRuleTools } from './tools/rules.js'
import { registerComponentTools } from './tools/components.js'

export function createServer(config: SonarConfig): McpServer {
  const server = new McpServer({
    name: 'SonarQube MCP Server',
    version: '0.1.0',
  })

  const client = new SonarQubeClient(config)

  // Register all 12 tools
  registerProjectTools(server, client, config)
  registerIssueTools(server, client)
  registerQualityGateTools(server, client)
  registerHotspotTools(server, client)
  registerMeasureTools(server, client)
  registerRuleTools(server, client)
  registerComponentTools(server, client)

  return server
}
