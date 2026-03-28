import { describe, it, expect, vi, afterEach } from 'vitest'
import { SonarQubeClient } from '../src/api/client.js'
import type { SonarConfig } from '../src/api/types.js'
import measuresFixture from './fixtures/measures.json'

const baseConfig: SonarConfig = {
  baseUrl: 'https://sonar.example.com',
  token: 'test-token',
  cacheTtlMs: 300000,
  cacheMaxSize: 100,
  timeoutMs: 5000,
  pageSize: 100,
}

describe('Measures Tools', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('should get measures for a project', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(measuresFixture),
    }) as typeof fetch
    const client = new SonarQubeClient(baseConfig)

    const result = await client.getMeasures('com.company:backend', ['coverage', 'bugs'])
    expect(result.component.measures).toHaveLength(10)
    const coverage = result.component.measures.find((m) => m.metric === 'coverage')
    expect(coverage?.value).toBe('78.5')
  })

  it('should get project measures shortcut', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(measuresFixture),
    }) as typeof fetch
    const client = new SonarQubeClient(baseConfig)

    const result = await client.getProjectMeasures('com.company:backend')
    expect(result).toHaveLength(10)
    const bugs = result.find((m) => m.metric === 'bugs')
    expect(bugs?.value).toBe('4')
  })

  it('should get measures history', async () => {
    const historyData = {
      measures: [
        {
          metric: 'coverage',
          history: [
            { date: '2024-12-01T00:00:00+0000', value: '76.2' },
            { date: '2024-12-05T00:00:00+0000', value: '77.1' },
            { date: '2024-12-08T00:00:00+0000', value: '78.5' },
          ],
        },
      ],
    }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(historyData),
    }) as typeof fetch
    const client = new SonarQubeClient(baseConfig)

    const result = await client.getMeasuresHistory('com.company:backend', ['coverage'])
    expect(result.measures).toHaveLength(1)
    expect(result.measures[0]!.history).toHaveLength(3)
  })
})
