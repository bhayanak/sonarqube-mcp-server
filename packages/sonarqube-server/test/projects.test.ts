import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SonarQubeClient } from '../src/api/client.js'
import type { SonarConfig } from '../src/api/types.js'
import projectFixture from './fixtures/project.json'
import issuesFixture from './fixtures/issues.json'
import qualityGateFixture from './fixtures/quality-gate.json'
import measuresFixture from './fixtures/measures.json'

const baseConfig: SonarConfig = {
  baseUrl: 'https://sonar.example.com',
  token: 'test-token',
  cacheTtlMs: 300000,
  cacheMaxSize: 100,
  timeoutMs: 5000,
  pageSize: 100,
}

function mockFetch(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

describe('SonarQubeClient', () => {
  let client: SonarQubeClient
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    client = new SonarQubeClient(baseConfig)
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('should list projects', async () => {
    globalThis.fetch = mockFetch(projectFixture) as typeof fetch
    const result = await client.listProjects()
    expect(result.components).toHaveLength(2)
    expect(result.components[0]!.key).toBe('com.company:backend')
  })

  it('should send bearer token header', async () => {
    const fetchMock = mockFetch(projectFixture)
    globalThis.fetch = fetchMock as typeof fetch
    await client.listProjects()
    const call = fetchMock.mock.calls[0]!
    expect(call[1].headers.Authorization).toBe('Bearer test-token')
  })

  it('should search issues', async () => {
    globalThis.fetch = mockFetch(issuesFixture) as typeof fetch
    const result = await client.searchIssues({ projectKey: 'com.company:backend' })
    expect(result.issues).toHaveLength(3)
    expect(result.issues[0]!.severity).toBe('CRITICAL')
  })

  it('should get quality gate status', async () => {
    globalThis.fetch = mockFetch(qualityGateFixture) as typeof fetch
    const result = await client.getQualityGateStatus('com.company:backend')
    expect(result.projectStatus.status).toBe('ERROR')
    expect(result.projectStatus.conditions).toHaveLength(4)
  })

  it('should get measures', async () => {
    globalThis.fetch = mockFetch(measuresFixture) as typeof fetch
    const result = await client.getMeasures('com.company:backend', ['coverage', 'bugs'])
    expect(result.component.measures).toHaveLength(10)
  })

  it('should handle API errors', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    }) as typeof fetch

    await expect(client.listProjects()).rejects.toThrow('SonarQube API error 401')
  })

  it('should cache repeated requests', async () => {
    const fetchMock = mockFetch(projectFixture)
    globalThis.fetch = fetchMock as typeof fetch
    await client.listProjects()
    await client.listProjects()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('should include organization param when configured', async () => {
    const orgClient = new SonarQubeClient({
      ...baseConfig,
      organization: 'my-org',
    })
    const fetchMock = mockFetch(projectFixture)
    globalThis.fetch = fetchMock as typeof fetch
    await orgClient.listProjects()
    const url = fetchMock.mock.calls[0]![0] as string
    expect(url).toContain('organization=my-org')
  })
})
