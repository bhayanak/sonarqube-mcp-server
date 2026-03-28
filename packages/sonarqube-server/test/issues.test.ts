import { describe, it, expect, vi, afterEach } from 'vitest'
import { SonarQubeClient } from '../src/api/client.js'
import type { SonarConfig } from '../src/api/types.js'
import issuesFixture from './fixtures/issues.json'

const baseConfig: SonarConfig = {
  baseUrl: 'https://sonar.example.com',
  token: 'test-token',
  cacheTtlMs: 300000,
  cacheMaxSize: 100,
  timeoutMs: 5000,
  pageSize: 100,
}

describe('Issue Tools', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('should search issues with severity filter', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(issuesFixture),
    })
    globalThis.fetch = fetchMock as typeof fetch
    const client = new SonarQubeClient(baseConfig)

    const result = await client.searchIssues({
      projectKey: 'com.company:backend',
      severities: ['CRITICAL', 'BLOCKER'],
    })
    expect(result.issues).toHaveLength(3)

    const url = fetchMock.mock.calls[0]![0] as string
    expect(url).toContain('severities=CRITICAL%2CBLOCKER')
  })

  it('should search issues with type filter', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(issuesFixture),
    })
    globalThis.fetch = fetchMock as typeof fetch
    const client = new SonarQubeClient(baseConfig)

    await client.searchIssues({
      projectKey: 'com.company:backend',
      types: ['BUG', 'VULNERABILITY'],
    })
    const url = fetchMock.mock.calls[0]![0] as string
    expect(url).toContain('types=BUG%2CVULNERABILITY')
  })

  it('should get a single issue', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(issuesFixture),
    }) as typeof fetch
    const client = new SonarQubeClient(baseConfig)

    const result = await client.getIssue('AXn8G001')
    expect(result.issue.key).toBe('AXn8G001')
    expect(result.issue.type).toBe('BUG')
  })

  it('should throw for missing issue', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ issues: [], paging: { total: 0, pageIndex: 1, pageSize: 10 } }),
    }) as typeof fetch
    const client = new SonarQubeClient(baseConfig)

    await expect(client.getIssue('MISSING')).rejects.toThrow('Issue not found')
  })
})
