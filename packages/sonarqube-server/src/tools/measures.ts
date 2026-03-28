import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SonarQubeClient } from '../api/client.js'
import { formatMeasures, formatMeasuresHistory } from '../utils/formatter.js'

const DEFAULT_METRICS = [
  'ncloc',
  'coverage',
  'duplicated_lines_density',
  'sqale_index',
  'reliability_rating',
  'security_rating',
  'sqale_rating',
  'bugs',
  'vulnerabilities',
  'code_smells',
]

export function registerMeasureTools(server: McpServer, client: SonarQubeClient) {
  server.tool(
    'sq_get_measures',
    'Get project metrics such as coverage, bugs, vulnerabilities, duplication, tech debt, and ratings',
    {
      projectKey: z.string().describe('Project key'),
      metrics: z
        .array(z.string())
        .optional()
        .describe(
          "Metric keys (e.g., 'coverage', 'bugs', 'vulnerabilities', 'code_smells', 'ncloc'). Omit for all key metrics.",
        ),
      component: z
        .string()
        .optional()
        .describe('Specific file or directory path within the project'),
    },
    async ({ projectKey, metrics, component }) => {
      const metricKeys = metrics ?? DEFAULT_METRICS
      const result = await client.getMeasures(projectKey, metricKeys, component)
      const text = formatMeasures(result.component.measures, projectKey)
      return { content: [{ type: 'text' as const, text }] }
    },
  )

  server.tool(
    'sq_get_measures_history',
    'Get metrics history over time to track trends and regressions',
    {
      projectKey: z.string().describe('Project key'),
      metrics: z.array(z.string()).describe('Metric keys to track'),
      from: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      to: z.string().optional().describe('End date (YYYY-MM-DD)'),
    },
    async ({ projectKey, metrics, from, to }) => {
      const result = await client.getMeasuresHistory(projectKey, metrics, from, to)
      const text = formatMeasuresHistory(result.measures, projectKey)
      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
