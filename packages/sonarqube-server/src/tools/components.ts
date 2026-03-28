import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SonarQubeClient } from '../api/client.js'
import { formatComponentTree } from '../utils/formatter.js'

export function registerComponentTools(server: McpServer, client: SonarQubeClient) {
  server.tool(
    'sq_get_component_tree',
    'Get project file tree with metrics — find files with worst coverage or most issues',
    {
      projectKey: z.string().describe('Project key'),
      component: z.string().optional().describe("Base component path (e.g., 'src/main/java')"),
      metrics: z
        .array(z.string())
        .optional()
        .default(['ncloc', 'coverage', 'bugs', 'vulnerabilities', 'code_smells']),
      sort: z.enum(['ncloc', 'coverage', 'bugs', 'vulnerabilities', 'code_smells']).optional(),
      sortAsc: z.boolean().optional().default(false),
      limit: z.number().optional().default(25),
    },
    async ({ projectKey, component, metrics, sort, sortAsc, limit }) => {
      const result = await client.getComponentTree(projectKey, {
        component,
        metrics,
        sort,
        sortAsc,
        limit,
      })
      const text = formatComponentTree(result.components, result.paging.total, projectKey)
      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
