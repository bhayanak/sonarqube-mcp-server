import { describe, it, expect, vi, afterEach } from 'vitest'
import { SonarQubeClient } from '../src/api/client.js'
import type { SonarConfig } from '../src/api/types.js'
import qualityGateFixture from './fixtures/quality-gate.json'

const baseConfig: SonarConfig = {
  baseUrl: 'https://sonar.example.com',
  token: 'test-token',
  cacheTtlMs: 300000,
  cacheMaxSize: 100,
  timeoutMs: 5000,
  pageSize: 100,
}

describe('Quality Gate Tools', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('should return quality gate status with conditions', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(qualityGateFixture),
    }) as typeof fetch
    const client = new SonarQubeClient(baseConfig)

    const result = await client.getQualityGateStatus('com.company:backend')
    expect(result.projectStatus.status).toBe('ERROR')
    const errorConditions = result.projectStatus.conditions.filter((c) => c.status === 'ERROR')
    expect(errorConditions).toHaveLength(2)
    const okConditions = result.projectStatus.conditions.filter((c) => c.status === 'OK')
    expect(okConditions).toHaveLength(2)
  })
})
