import type { SonarConfig } from './api/types.js'

export function loadConfig(): SonarConfig {
  const baseUrl = process.env['SONAR_MCP_BASE_URL']
  const token = process.env['SONAR_MCP_TOKEN']

  if (!baseUrl) {
    throw new Error('SONAR_MCP_BASE_URL environment variable is required')
  }
  if (!token) {
    throw new Error('SONAR_MCP_TOKEN environment variable is required')
  }

  // Warn if not HTTPS
  if (baseUrl.startsWith('http://')) {
    console.error('[WARN] SONAR_MCP_BASE_URL uses HTTP. HTTPS is strongly recommended.')
  }

  const normalized = baseUrl.replace(/\/+$/, '')

  return {
    baseUrl: normalized,
    token,
    organization: process.env['SONAR_MCP_ORGANIZATION'] || undefined,
    cacheTtlMs: parseInt(process.env['SONAR_MCP_CACHE_TTL_MS'] || '300000', 10),
    cacheMaxSize: parseInt(process.env['SONAR_MCP_CACHE_MAX_SIZE'] || '100', 10),
    timeoutMs: parseInt(process.env['SONAR_MCP_TIMEOUT_MS'] || '15000', 10),
    defaultProject: process.env['SONAR_MCP_DEFAULT_PROJECT'] || undefined,
    pageSize: parseInt(process.env['SONAR_MCP_PAGE_SIZE'] || '100', 10),
  }
}
