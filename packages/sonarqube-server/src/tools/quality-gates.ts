import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SonarQubeClient } from '../api/client.js'
import { formatQualityGate } from '../utils/formatter.js'

export function registerQualityGateTools(server: McpServer, client: SonarQubeClient) {
  server.tool(
    'sq_get_quality_gate',
    'Get quality gate status for a project — shows passed/failed conditions and thresholds',
    {
      projectKey: z.string().describe('Project key'),
    },
    async ({ projectKey }) => {
      const result = await client.getQualityGateStatus(projectKey)
      const text = formatQualityGate(result.projectStatus, projectKey)
      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
