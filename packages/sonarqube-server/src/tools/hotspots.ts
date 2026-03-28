import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SonarQubeClient } from '../api/client.js'
import { formatHotspotList, formatHotspotDetail } from '../utils/formatter.js'

export function registerHotspotTools(server: McpServer, client: SonarQubeClient) {
  server.tool(
    'sq_search_hotspots',
    'Search security hotspots needing review for a project',
    {
      projectKey: z.string().describe('Project key'),
      status: z.enum(['TO_REVIEW', 'REVIEWED']).optional(),
      resolution: z.enum(['FIXED', 'SAFE', 'ACKNOWLEDGED']).optional(),
      limit: z.number().optional().default(25),
    },
    async (params) => {
      const result = await client.searchHotspots(params)
      const text = formatHotspotList(result.hotspots, result.paging.total)
      return { content: [{ type: 'text' as const, text }] }
    },
  )

  server.tool(
    'sq_get_hotspot',
    'Get detailed information about a specific security hotspot',
    {
      hotspotKey: z.string().describe('Hotspot key'),
    },
    async ({ hotspotKey }) => {
      const result = await client.getHotspot(hotspotKey)
      const text = formatHotspotDetail(result)
      return { content: [{ type: 'text' as const, text }] }
    },
  )
}
