import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadConfig } from '../src/config.js'

describe('loadConfig', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Clear relevant env vars
    delete process.env['SONAR_MCP_BASE_URL']
    delete process.env['SONAR_MCP_TOKEN']
    delete process.env['SONAR_MCP_ORGANIZATION']
    delete process.env['SONAR_MCP_CACHE_TTL_MS']
    delete process.env['SONAR_MCP_CACHE_MAX_SIZE']
    delete process.env['SONAR_MCP_TIMEOUT_MS']
    delete process.env['SONAR_MCP_DEFAULT_PROJECT']
    delete process.env['SONAR_MCP_PAGE_SIZE']
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('should throw if SONAR_MCP_BASE_URL is missing', () => {
    process.env['SONAR_MCP_TOKEN'] = 'tok'
    expect(() => loadConfig()).toThrow('SONAR_MCP_BASE_URL environment variable is required')
  })

  it('should throw if SONAR_MCP_TOKEN is missing', () => {
    process.env['SONAR_MCP_BASE_URL'] = 'https://sonar.example.com'
    expect(() => loadConfig()).toThrow('SONAR_MCP_TOKEN environment variable is required')
  })

  it('should load config with required values', () => {
    process.env['SONAR_MCP_BASE_URL'] = 'https://sonar.example.com'
    process.env['SONAR_MCP_TOKEN'] = 'my-token'
    const config = loadConfig()
    expect(config.baseUrl).toBe('https://sonar.example.com')
    expect(config.token).toBe('my-token')
  })

  it('should strip trailing slashes from base URL', () => {
    process.env['SONAR_MCP_BASE_URL'] = 'https://sonar.example.com///'
    process.env['SONAR_MCP_TOKEN'] = 'tok'
    const config = loadConfig()
    expect(config.baseUrl).toBe('https://sonar.example.com')
  })

  it('should warn on HTTP base URL', () => {
    process.env['SONAR_MCP_BASE_URL'] = 'http://sonar.example.com'
    process.env['SONAR_MCP_TOKEN'] = 'tok'
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    loadConfig()
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('HTTPS is strongly recommended'))
    spy.mockRestore()
  })

  it('should use defaults for optional config', () => {
    process.env['SONAR_MCP_BASE_URL'] = 'https://sonar.example.com'
    process.env['SONAR_MCP_TOKEN'] = 'tok'
    const config = loadConfig()
    expect(config.cacheTtlMs).toBe(300000)
    expect(config.cacheMaxSize).toBe(100)
    expect(config.timeoutMs).toBe(15000)
    expect(config.pageSize).toBe(100)
    expect(config.organization).toBeUndefined()
    expect(config.defaultProject).toBeUndefined()
  })

  it('should parse optional env vars', () => {
    process.env['SONAR_MCP_BASE_URL'] = 'https://sonar.example.com'
    process.env['SONAR_MCP_TOKEN'] = 'tok'
    process.env['SONAR_MCP_ORGANIZATION'] = 'my-org'
    process.env['SONAR_MCP_CACHE_TTL_MS'] = '60000'
    process.env['SONAR_MCP_CACHE_MAX_SIZE'] = '50'
    process.env['SONAR_MCP_TIMEOUT_MS'] = '10000'
    process.env['SONAR_MCP_DEFAULT_PROJECT'] = 'my-proj'
    process.env['SONAR_MCP_PAGE_SIZE'] = '50'
    const config = loadConfig()
    expect(config.organization).toBe('my-org')
    expect(config.cacheTtlMs).toBe(60000)
    expect(config.cacheMaxSize).toBe(50)
    expect(config.timeoutMs).toBe(10000)
    expect(config.defaultProject).toBe('my-proj')
    expect(config.pageSize).toBe(50)
  })
})
