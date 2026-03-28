import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SonarQubeClient } from '../api/client.js'
import { formatRule, formatRuleList } from '../utils/formatter.js'

export function registerRuleTools(server: McpServer, client: SonarQubeClient) {
  server.tool(
    'sq_get_rule',
    'Get detailed information about an analysis rule — description, remediation, examples',
    {
      ruleKey: z.string().describe("Rule key (e.g., 'java:S2095')"),
    },
    async ({ ruleKey }) => {
      const result = await client.getRule(ruleKey)
      const text = formatRule(result.rule)
      return { content: [{ type: 'text' as const, text }] }
    },
  )

  server.tool(
    'sq_search_rules',
    'Search analysis rules by language, type, severity, or tags',
    {
      query: z.string().optional().describe('Search by rule name or description'),
      languages: z.array(z.string()).optional().describe('Filter by language (java, js, ts, etc.)'),
      types: z.array(z.enum(['BUG', 'VULNERABILITY', 'CODE_SMELL', 'SECURITY_HOTSPOT'])).optional(),
      severities: z.array(z.enum(['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'])).optional(),
      tags: z.array(z.string()).optional().describe('Filter by tags (cwe, owasp, cert, etc.)'),
      limit: z.number().optional().default(20),
    },
    async (params) => {
      const result = await client.searchRules(params)
      const text = formatRuleList(result.rules, result.total ?? result.paging.total)
      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
