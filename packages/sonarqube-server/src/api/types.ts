// SonarQube API response types

export type Severity = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO'
export type IssueStatus = 'OPEN' | 'CONFIRMED' | 'REOPENED' | 'RESOLVED' | 'CLOSED'
export type IssueType = 'BUG' | 'VULNERABILITY' | 'CODE_SMELL' | 'SECURITY_HOTSPOT'

export interface TextRange {
  startLine: number
  endLine: number
  startOffset: number
  endOffset: number
}

export interface Flow {
  locations: Array<{
    component: string
    textRange: TextRange
    msg: string
  }>
}

export interface Project {
  key: string
  name: string
  qualifier: 'TRK' | 'APP' | 'VW'
  visibility: 'public' | 'private'
  lastAnalysisDate?: string
  revision?: string
  version?: string
}

export interface Issue {
  key: string
  rule: string
  severity: Severity
  component: string
  project: string
  line?: number
  hash?: string
  textRange?: TextRange
  status: IssueStatus
  message: string
  effort?: string
  debt?: string
  author?: string
  tags: string[]
  creationDate: string
  updateDate?: string
  type: IssueType
  flows?: Flow[]
}

export interface QualityGateCondition {
  status: 'OK' | 'ERROR' | 'WARN'
  metricKey: string
  comparator: 'GT' | 'LT'
  errorThreshold: string
  actualValue: string
}

export interface QualityGateStatus {
  status: 'OK' | 'ERROR' | 'WARN'
  conditions: QualityGateCondition[]
}

export interface RuleRef {
  key: string
  name: string
  securityCategory: string
  vulnerabilityProbability: string
}

export interface Hotspot {
  key: string
  component: string
  project: string
  securityCategory: string
  vulnerabilityProbability: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'TO_REVIEW' | 'REVIEWED'
  resolution?: 'FIXED' | 'SAFE' | 'ACKNOWLEDGED'
  line?: number
  message: string
  author?: string
  creationDate: string
  rule?: RuleRef
}

export interface Measure {
  metric: string
  value?: string
  component?: string
  bestValue?: boolean
}

export interface MeasureHistory {
  metric: string
  history: Array<{ date: string; value: string }>
}

export interface Rule {
  key: string
  name: string
  severity: Severity
  type: IssueType
  lang?: string
  langName?: string
  htmlDesc?: string
  mdDesc?: string
  tags: string[]
  sysTags?: string[]
  remFnType?: string
  remFnBaseEffort?: string
  template?: boolean
}

export interface ComponentNode {
  key: string
  name: string
  qualifier: string
  path?: string
  language?: string
  measures?: Measure[]
}

export interface Paging {
  pageIndex: number
  pageSize: number
  total: number
}

export interface Facet {
  property: string
  values: Array<{ val: string; count: number }>
}

export interface IssuePage {
  total: number
  issues: Issue[]
  paging: Paging
  facets?: Facet[]
}

export interface HotspotPage {
  paging: Paging
  hotspots: Hotspot[]
}

export interface RulePage {
  total: number
  rules: Rule[]
  paging: Paging
}

export interface ComponentPage {
  paging: Paging
  components: ComponentNode[]
}

export interface SonarConfig {
  baseUrl: string
  token: string
  organization?: string
  cacheTtlMs: number
  cacheMaxSize: number
  timeoutMs: number
  defaultProject?: string
  pageSize: number
}
