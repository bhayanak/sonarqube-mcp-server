import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SonarQubeClient } from '../api/client.js'
import type { SonarConfig } from '../api/types.js'
import { formatProjectList, formatProjectOverview } from '../utils/formatter.js'

export function registerProjectTools(
  server: McpServer,
  client: SonarQubeClient,
  config: SonarConfig,
) {
  server.tool(
    'sq_list_projects',
    'List SonarQube projects with their quality status and key metrics',
    {
      query: z.string().optional().describe('Search by project name or key'),
      qualifiers: z
        .enum(['TRK', 'APP', 'VW'])
        .optional()
        .default('TRK')
        .describe('Project type (TRK=project, APP=application, VW=portfolio)'),
      limit: z.number().optional().default(25),
    },
    async ({ query, qualifiers, limit }) => {
      const result = await client.listProjects(query, qualifiers, limit)
      const text = formatProjectList(result.components, config.baseUrl)
      return { content: [{ type: 'text' as const, text }] }
    },
  )

  server.tool(
    'sq_get_project',
    'Get a detailed project overview with quality gate status and key metrics',
    {
      projectKey: z.string().describe("Project key (e.g., 'com.company:backend')"),
    },
    async ({ projectKey }) => {
      const [projectResult, measures, gateResult] = await Promise.all([
        client.getProject(projectKey),
        client.getProjectMeasures(projectKey),
        client.getQualityGateStatus(projectKey).catch(() => null),
      ])
      const text = formatProjectOverview(
        projectResult.component,
        measures,
        gateResult?.projectStatus,
      )
      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
