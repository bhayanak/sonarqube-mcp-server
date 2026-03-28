import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SonarQubeClient } from '../api/client.js'
import { formatIssueList, formatIssueDetail } from '../utils/formatter.js'

export function registerIssueTools(server: McpServer, client: SonarQubeClient) {
  server.tool(
    'sq_search_issues',
    'Search for issues (bugs, vulnerabilities, code smells) with filtering by severity, type, file, rule, etc.',
    {
      projectKey: z.string().optional().describe('Filter by project key'),
      severities: z.array(z.enum(['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'])).optional(),
      types: z.array(z.enum(['BUG', 'VULNERABILITY', 'CODE_SMELL', 'SECURITY_HOTSPOT'])).optional(),
      statuses: z.array(z.enum(['OPEN', 'CONFIRMED', 'REOPENED', 'RESOLVED', 'CLOSED'])).optional(),
      tags: z.array(z.string()).optional(),
      createdAfter: z.string().optional().describe("ISO date (e.g., '2024-01-01')"),
      assignee: z.string().optional().describe('Assignee login'),
      languages: z
        .array(z.string())
        .optional()
        .describe('Filter by language (java, js, ts, py, etc.)'),
      rules: z.array(z.string()).optional().describe('Filter by rule key'),
      limit: z.number().optional().default(25),
      sort: z.enum(['SEVERITY', 'CREATION_DATE', 'UPDATE_DATE', 'CLOSE_DATE']).optional(),
    },
    async (params) => {
      const result = await client.searchIssues(params)
      const text = formatIssueList(result.issues, result.total ?? result.paging.total)
      return { content: [{ type: 'text' as const, text }] }
    },
  )

  server.tool(
    'sq_get_issue',
    'Get detailed information about a specific issue including its location, rule, and remediation effort',
    {
      issueKey: z.string().describe("Issue key (e.g., 'AXn8G...')"),
    },
    async ({ issueKey }) => {
      const result = await client.getIssue(issueKey)
      const text = formatIssueDetail(result.issue)
      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
