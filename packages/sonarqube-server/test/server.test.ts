import { describe, it, expect } from 'vitest'
import { createServer } from '../src/server.js'
import type { SonarConfig } from '../src/api/types.js'

const testConfig: SonarConfig = {
  baseUrl: 'https://sonar.example.com',
  token: 'test-token',
  cacheTtlMs: 300000,
  cacheMaxSize: 100,
  timeoutMs: 5000,
  pageSize: 100,
}

describe('createServer', () => {
  it('should create an MCP server instance', () => {
    const server = createServer(testConfig)
    expect(server).toBeDefined()
  })

  it('should create server with organization config', () => {
    const server = createServer({ ...testConfig, organization: 'my-org' })
    expect(server).toBeDefined()
  })

  it('should create server with default project', () => {
    const server = createServer({ ...testConfig, defaultProject: 'my-proj' })
    expect(server).toBeDefined()
  })
})
