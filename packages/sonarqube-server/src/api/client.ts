import type {
  SonarConfig,
  Project,
  Issue,
  IssuePage,
  QualityGateStatus,
  Hotspot,
  HotspotPage,
  Measure,
  MeasureHistory,
  Rule,
  RulePage,
  ComponentPage,
} from './types.js'
import { LRUCache } from './cache.js'

export class SonarQubeClient {
  private readonly config: SonarConfig
  private readonly cache: LRUCache

  constructor(config: SonarConfig) {
    this.config = config
    this.cache = new LRUCache(config.cacheMaxSize, config.cacheTtlMs)
  }

  private async request<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
    const url = new URL(`${this.config.baseUrl}/api/${path}`)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') {
          url.searchParams.set(k, v)
        }
      }
    }
    if (this.config.organization) {
      url.searchParams.set('organization', this.config.organization)
    }

    const cacheKey = url.toString()
    const cached = this.cache.get<T>(cacheKey)
    if (cached !== undefined) return cached

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs)

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.config.token}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      })

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`SonarQube API error ${response.status}: ${body}`)
      }

      const data = (await response.json()) as T
      this.cache.set(cacheKey, data)
      return data
    } finally {
      clearTimeout(timeout)
    }
  }

  // --- Projects ---

  async listProjects(
    query?: string,
    qualifiers = 'TRK',
    limit = 25,
  ): Promise<{ components: Project[]; paging: { total: number } }> {
    return this.request('components/search', {
      q: query,
      qualifiers,
      ps: String(limit),
    })
  }

  async getProject(
    key: string,
  ): Promise<{ component: Project & { measures?: Array<{ metric: string; value: string }> } }> {
    return this.request('components/show', { component: key })
  }

  async getProjectStatus(projectKey: string): Promise<{ projectStatus: QualityGateStatus }> {
    return this.request('qualitygates/project_status', {
      projectKey,
    })
  }

  // --- Issues ---

  async searchIssues(params: {
    projectKey?: string
    severities?: string[]
    types?: string[]
    statuses?: string[]
    tags?: string[]
    createdAfter?: string
    assignee?: string
    languages?: string[]
    rules?: string[]
    limit?: number
    sort?: string
  }): Promise<IssuePage> {
    return this.request('issues/search', {
      componentKeys: params.projectKey,
      severities: params.severities?.join(','),
      types: params.types?.join(','),
      statuses: params.statuses?.join(','),
      tags: params.tags?.join(','),
      createdAfter: params.createdAfter,
      assignees: params.assignee,
      languages: params.languages?.join(','),
      rules: params.rules?.join(','),
      ps: String(params.limit ?? 25),
      s: params.sort,
      facets: 'severities,types',
    })
  }

  async getIssue(key: string): Promise<{ issue: Issue }> {
    const result = await this.request<IssuePage>('issues/search', {
      issues: key,
    })
    const issue = result.issues[0]
    if (!issue) {
      throw new Error(`Issue not found: ${key}`)
    }
    return { issue }
  }

  // --- Quality Gates ---

  async getQualityGateStatus(projectKey: string): Promise<{ projectStatus: QualityGateStatus }> {
    return this.request('qualitygates/project_status', {
      projectKey,
    })
  }

  // --- Hotspots ---

  async searchHotspots(params: {
    projectKey: string
    status?: string
    resolution?: string
    limit?: number
  }): Promise<HotspotPage> {
    return this.request('hotspots/search', {
      projectKey: params.projectKey,
      status: params.status,
      resolution: params.resolution,
      ps: String(params.limit ?? 25),
    })
  }

  async getHotspot(key: string): Promise<Hotspot> {
    return this.request('hotspots/show', { hotspot: key })
  }

  // --- Measures ---

  async getMeasures(
    projectKey: string,
    metrics: string[],
    component?: string,
  ): Promise<{ component: { measures: Measure[] } }> {
    return this.request('measures/component', {
      component: component ?? projectKey,
      metricKeys: metrics.join(','),
    })
  }

  async getMeasuresHistory(
    projectKey: string,
    metrics: string[],
    from?: string,
    to?: string,
  ): Promise<{ measures: MeasureHistory[] }> {
    return this.request('measures/search_history', {
      component: projectKey,
      metrics: metrics.join(','),
      from,
      to,
    })
  }

  // --- Rules ---

  async getRule(key: string): Promise<{ rule: Rule }> {
    return this.request('rules/show', { key })
  }

  async searchRules(params: {
    query?: string
    languages?: string[]
    types?: string[]
    severities?: string[]
    tags?: string[]
    limit?: number
  }): Promise<RulePage> {
    return this.request('rules/search', {
      q: params.query,
      languages: params.languages?.join(','),
      types: params.types?.join(','),
      severities: params.severities?.join(','),
      tags: params.tags?.join(','),
      ps: String(params.limit ?? 20),
    })
  }

  // --- Components ---

  async getComponentTree(
    projectKey: string,
    params?: {
      component?: string
      metrics?: string[]
      sort?: string
      sortAsc?: boolean
      limit?: number
    },
  ): Promise<ComponentPage> {
    const metrics = params?.metrics ?? [
      'ncloc',
      'coverage',
      'bugs',
      'vulnerabilities',
      'code_smells',
    ]
    return this.request('measures/component_tree', {
      component: params?.component ?? projectKey,
      metricKeys: metrics.join(','),
      s: params?.sort ? `metric,${params.sort}` : undefined,
      asc: params?.sortAsc !== undefined ? String(params.sortAsc) : undefined,
      ps: String(params?.limit ?? 25),
      strategy: 'leaves',
      qualifiers: 'FIL',
    })
  }

  // --- Project measures shortcut ---

  async getProjectMeasures(projectKey: string): Promise<Array<{ metric: string; value: string }>> {
    const defaultMetrics = [
      'ncloc',
      'coverage',
      'duplicated_lines_density',
      'sqale_index',
      'reliability_rating',
      'security_rating',
      'sqale_rating',
      'bugs',
      'vulnerabilities',
      'code_smells',
    ]
    const result = await this.getMeasures(projectKey, defaultMetrics)
    return (result.component.measures ?? []).map((m) => ({
      metric: m.metric,
      value: m.value ?? '0',
    }))
  }
}
