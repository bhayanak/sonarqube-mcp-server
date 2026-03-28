#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { loadConfig } from './config.js'
import { createServer } from './server.js'

async function main() {
  const config = loadConfig()
  const server = createServer(config)
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('SonarQube MCP Server running on stdio')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
