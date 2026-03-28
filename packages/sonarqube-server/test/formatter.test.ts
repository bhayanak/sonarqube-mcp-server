import { describe, it, expect } from 'vitest'
import {
  formatSeverity,
  formatRating,
  formatQualityGateStatus,
  SEVERITY_ICONS,
  SEVERITY_ORDER,
} from '../src/utils/severity.js'
import {
  formatProjectList,
  formatProjectOverview,
  formatIssueList,
  formatIssueDetail,
  formatQualityGate,
  formatHotspotList,
  formatHotspotDetail,
  formatMeasures,
  formatMeasuresHistory,
  formatRule,
  formatRuleList,
  formatComponentTree,
} from '../src/utils/formatter.js'
import type {
  Project,
  Issue,
  QualityGateStatus,
  Hotspot,
  Measure,
  Rule,
  ComponentNode,
} from '../src/api/types.js'

describe('Severity Utils', () => {
  it('should format severity with icon', () => {
    expect(formatSeverity('CRITICAL')).toBe('🟠 CRITICAL')
    expect(formatSeverity('BLOCKER')).toBe('🔴 BLOCKER')
    expect(formatSeverity('INFO')).toBe('⚪ INFO')
  })

  it('should format ratings', () => {
    expect(formatRating('1.0')).toBe('A')
    expect(formatRating('3.0')).toBe('C')
    expect(formatRating('5.0')).toBe('E')
  })

  it('should format quality gate status', () => {
    expect(formatQualityGateStatus('OK')).toBe('✅ PASSED')
    expect(formatQualityGateStatus('ERROR')).toBe('❌ FAILED')
    expect(formatQualityGateStatus('WARN')).toBe('⚠️ WARNING')
  })

  it('should have all severity icons', () => {
    for (const sev of SEVERITY_ORDER) {
      expect(SEVERITY_ICONS[sev]).toBeDefined()
    }
  })
})

describe('Formatter', () => {
  it('should format project list', () => {
    const projects: Project[] = [
      {
        key: 'backend',
        name: 'Backend API',
        qualifier: 'TRK',
        visibility: 'public',
        lastAnalysisDate: '2024-12-14T08:30:00+0000',
      },
    ]
    const result = formatProjectList(projects, 'https://sonar.example.com')
    expect(result).toContain('Backend API')
    expect(result).toContain('sonar.example.com')
    expect(result).toContain('1 projects')
  })

  it('should format project overview with metrics', () => {
    const project: Project = {
      key: 'backend',
      name: 'Backend API',
      qualifier: 'TRK',
      visibility: 'public',
      version: '3.2.1',
      lastAnalysisDate: '2024-12-14T08:30:00+0000',
    }
    const measures = [
      { metric: 'ncloc', value: '45230' },
      { metric: 'coverage', value: '78.5' },
      { metric: 'bugs', value: '4' },
      { metric: 'vulnerabilities', value: '2' },
      { metric: 'code_smells', value: '42' },
      { metric: 'reliability_rating', value: '1.0' },
    ]
    const result = formatProjectOverview(project, measures)
    expect(result).toContain('Backend API')
    expect(result).toContain('78.5%')
    expect(result).toContain('45,230')
    expect(result).toContain('🐛 Bugs: 4')
  })

  it('should format issue list with severity grouping', () => {
    const issues: Issue[] = [
      {
        key: 'K1',
        rule: 'java:S2095',
        severity: 'CRITICAL',
        component: 'proj:src/DataService.java',
        project: 'proj',
        line: 42,
        status: 'OPEN',
        message: 'Close this stream',
        effort: '15min',
        tags: ['cwe'],
        creationDate: '2024-12-10',
        type: 'BUG',
      },
    ]
    const result = formatIssueList(issues, 1)
    expect(result).toContain('🟠 CRITICAL')
    expect(result).toContain('Close this stream')
    expect(result).toContain('DataService.java:42')
  })

  it('should format quality gate with failed and passed conditions', () => {
    const status: QualityGateStatus = {
      status: 'ERROR',
      conditions: [
        {
          status: 'ERROR',
          metricKey: 'coverage',
          comparator: 'LT',
          errorThreshold: '80',
          actualValue: '65.2',
        },
        {
          status: 'OK',
          metricKey: 'reliability',
          comparator: 'GT',
          errorThreshold: '1',
          actualValue: '1',
        },
      ],
    }
    const result = formatQualityGate(status, 'Backend')
    expect(result).toContain('❌ FAILED')
    expect(result).toContain('Backend')
    expect(result).toContain('Failed Conditions')
    expect(result).toContain('Passed Conditions')
  })

  it('should format measures history with sparkline', () => {
    const histories = [
      {
        metric: 'coverage',
        history: [
          { date: '2024-12-01', value: '76.2' },
          { date: '2024-12-05', value: '77.1' },
          { date: '2024-12-08', value: '78.5' },
        ],
      },
    ]
    const result = formatMeasuresHistory(histories, 'backend')
    expect(result).toContain('coverage')
    expect(result).toContain('Sparkline')
    expect(result).toContain('Overall change')
  })

  it('should format rule detail', () => {
    const rule: Rule = {
      key: 'java:S2095',
      name: 'Resources should be closed',
      severity: 'BLOCKER',
      type: 'BUG',
      langName: 'Java',
      tags: ['cert', 'cwe'],
      mdDesc: 'Close resources after use.',
      remFnBaseEffort: '5min',
    }
    const result = formatRule(rule)
    expect(result).toContain('java:S2095')
    expect(result).toContain('Resources should be closed')
    expect(result).toContain('Java')
    expect(result).toContain('5min')
  })

  it('should format component tree', () => {
    const components: ComponentNode[] = [
      {
        key: 'proj:src/DataService.java',
        name: 'DataService.java',
        qualifier: 'FIL',
        path: 'src/DataService.java',
        measures: [
          { metric: 'ncloc', value: '420' },
          { metric: 'coverage', value: '45.2' },
          { metric: 'bugs', value: '2' },
        ],
      },
    ]
    const result = formatComponentTree(components, 1, 'proj')
    expect(result).toContain('DataService.java')
    expect(result).toContain('45.2%')
  })

  // --- Additional coverage tests ---

  it('should format project list with no analysis date', () => {
    const projects: Project[] = [
      {
        key: 'proj',
        name: 'No Analysis Project',
        qualifier: 'TRK',
        visibility: 'private',
      },
    ]
    const result = formatProjectList(projects, 'https://sonar.example.com')
    expect(result).toContain('Never')
  })

  it('should format project overview without optional fields', () => {
    const project: Project = {
      key: 'proj',
      name: 'Minimal Project',
      qualifier: 'TRK',
      visibility: 'public',
    }
    const result = formatProjectOverview(project, [])
    expect(result).toContain('Minimal Project')
    expect(result).toContain('🐛 Bugs: 0')
  })

  it('should format project overview with duplications and debt', () => {
    const project: Project = {
      key: 'proj',
      name: 'Full Project',
      qualifier: 'TRK',
      visibility: 'public',
      lastAnalysisDate: '2024-12-14T08:30:00+0000',
      version: '2.0.0',
    }
    const measures = [
      { metric: 'duplicated_lines_density', value: '5.5' },
      { metric: 'sqale_index', value: '960' },
      { metric: 'security_rating', value: '2.0' },
      { metric: 'sqale_rating', value: '3.0' },
    ]
    const gateStatus: QualityGateStatus = { status: 'OK', conditions: [] }
    const result = formatProjectOverview(project, measures, gateStatus)
    expect(result).toContain('5.5%')
    expect(result).toContain('2d 0h')
    expect(result).toContain('✅ PASSED')
    expect(result).toContain('Version: 2.0.0')
  })

  it('should format issue detail with all optional fields', () => {
    const issue: Issue = {
      key: 'K2',
      rule: 'java:S1000',
      severity: 'MAJOR',
      component: 'proj:src/Foo.java',
      project: 'proj',
      line: 10,
      status: 'OPEN',
      message: 'Fix this',
      effort: '10min',
      author: 'dev@example.com',
      tags: ['owasp', 'cwe'],
      creationDate: '2024-12-10',
      type: 'CODE_SMELL',
    }
    const result = formatIssueDetail(issue)
    expect(result).toContain('🟡 MAJOR')
    expect(result).toContain('Effort: 10min')
    expect(result).toContain('Author: dev@example.com')
    expect(result).toContain('Tags: owasp, cwe')
    expect(result).toContain('Foo.java:10')
  })

  it('should format issue detail without optional fields', () => {
    const issue: Issue = {
      key: 'K3',
      rule: 'java:S1000',
      severity: 'INFO',
      component: 'proj:src/Bar.java',
      project: 'proj',
      status: 'CLOSED',
      message: 'Info only',
      tags: [],
      creationDate: '2024-12-10',
      type: 'CODE_SMELL',
    }
    const result = formatIssueDetail(issue)
    expect(result).toContain('⚪ INFO')
    expect(result).not.toContain('Effort:')
    expect(result).not.toContain('Author:')
    expect(result).not.toContain('Tags:')
  })

  it('should format issue list with issues without line/effort/tags', () => {
    const issues: Issue[] = [
      {
        key: 'K4',
        rule: 'java:S1000',
        severity: 'MINOR',
        component: 'proj:src/Baz.java',
        project: 'proj',
        status: 'OPEN',
        message: 'Minor issue',
        tags: [],
        creationDate: '2024-12-10',
        type: 'CODE_SMELL',
      },
    ]
    const result = formatIssueList(issues, 1)
    expect(result).toContain('🔵 MINOR')
    expect(result).not.toContain('Tags:')
  })

  it('should format quality gate without project name', () => {
    const status: QualityGateStatus = {
      status: 'OK',
      conditions: [
        {
          status: 'OK',
          metricKey: 'coverage',
          comparator: 'LT',
          errorThreshold: '80',
          actualValue: '85',
        },
      ],
    }
    const result = formatQualityGate(status)
    expect(result).toContain('✅ PASSED')
    expect(result).not.toContain('—')
  })

  it('should format quality gate with warning conditions', () => {
    const status: QualityGateStatus = {
      status: 'WARN',
      conditions: [
        {
          status: 'WARN',
          metricKey: 'coverage',
          comparator: 'LT',
          errorThreshold: '80',
          actualValue: '75',
        },
      ],
    }
    const result = formatQualityGate(status, 'MyProject')
    expect(result).toContain('⚠️ WARNING')
    expect(result).toContain('Warning Conditions')
  })

  it('should format hotspot list', () => {
    const hotspots: Hotspot[] = [
      {
        key: 'H1',
        component: 'proj:src/Auth.java',
        project: 'proj',
        securityCategory: 'auth',
        vulnerabilityProbability: 'HIGH',
        status: 'TO_REVIEW',
        line: 42,
        message: 'Review this auth code',
        creationDate: '2024-12-10',
      },
      {
        key: 'H2',
        component: 'proj:src/Sql.java',
        project: 'proj',
        securityCategory: 'sql-injection',
        vulnerabilityProbability: 'MEDIUM',
        status: 'REVIEWED',
        resolution: 'SAFE',
        message: 'SQL parameter',
        creationDate: '2024-12-08',
      },
    ]
    const result = formatHotspotList(hotspots, 2)
    expect(result).toContain('Security Hotspots — 2 total')
    expect(result).toContain('[HIGH] TO_REVIEW')
    expect(result).toContain('Auth.java:42')
    expect(result).toContain('[MEDIUM] REVIEWED')
  })

  it('should format hotspot detail with resolution', () => {
    const hotspot: Hotspot = {
      key: 'H1',
      component: 'proj:src/Auth.java',
      project: 'proj',
      securityCategory: 'auth',
      vulnerabilityProbability: 'HIGH',
      status: 'REVIEWED',
      resolution: 'FIXED',
      line: 42,
      message: 'Fixed auth issue',
      author: 'dev@example.com',
      creationDate: '2024-12-10',
    }
    const result = formatHotspotDetail(hotspot)
    expect(result).toContain('REVIEWED (FIXED)')
    expect(result).toContain('Author: dev@example.com')
    expect(result).toContain('Auth.java:42')
  })

  it('should format hotspot detail without optional fields', () => {
    const hotspot: Hotspot = {
      key: 'H2',
      component: 'proj:src/Config.java',
      project: 'proj',
      securityCategory: 'crypto',
      vulnerabilityProbability: 'LOW',
      status: 'TO_REVIEW',
      message: 'Weak crypto',
      creationDate: '2024-12-10',
    }
    const result = formatHotspotDetail(hotspot)
    expect(result).toContain('TO_REVIEW')
    expect(result).not.toContain('Author:')
    expect(result).not.toContain('FIXED')
  })

  it('should format measures', () => {
    const measures: Measure[] = [
      { metric: 'coverage', value: '80.5' },
      { metric: 'bugs', value: '3' },
      { metric: 'no_value', value: undefined },
    ]
    const result = formatMeasures(measures, 'proj')
    expect(result).toContain('Measures for proj')
    expect(result).toContain('coverage: 80.5')
    expect(result).toContain('bugs: 3')
    expect(result).toContain('no_value: N/A')
  })

  it('should format measures history with decreasing values', () => {
    const histories = [
      {
        metric: 'bugs',
        history: [
          { date: '2024-12-01', value: '10' },
          { date: '2024-12-05', value: '8' },
        ],
      },
    ]
    const result = formatMeasuresHistory(histories, 'proj')
    expect(result).toContain('-2.0')
    expect(result).toContain('Overall change: -2.0')
  })

  it('should format measures history with single data point', () => {
    const histories = [
      {
        metric: 'coverage',
        history: [{ date: '2024-12-01', value: '80' }],
      },
    ]
    const result = formatMeasuresHistory(histories, 'proj')
    expect(result).toContain('coverage')
    expect(result).not.toContain('Overall change')
  })

  it('should format measures history with flat values', () => {
    const histories = [
      {
        metric: 'coverage',
        history: [
          { date: '2024-12-01', value: '80' },
          { date: '2024-12-05', value: '80' },
        ],
      },
    ]
    const result = formatMeasuresHistory(histories, 'proj')
    expect(result).toContain('0.0%')
    expect(result).toContain('Overall change: 0.0')
  })

  it('should format rule without optional fields', () => {
    const rule: Rule = {
      key: 'ts:S100',
      name: 'Some rule',
      severity: 'MINOR',
      type: 'CODE_SMELL',
      tags: [],
    }
    const result = formatRule(rule)
    expect(result).toContain('ts:S100')
    expect(result).not.toContain('Language:')
    expect(result).not.toContain('Tags:')
    expect(result).not.toContain('Remediation:')
    expect(result).not.toContain('Description:')
  })

  it('should format rule list', () => {
    const rules: Rule[] = [
      { key: 'java:S1', name: 'Rule One', severity: 'CRITICAL', type: 'BUG', tags: [] },
      {
        key: 'java:S2',
        name: 'Rule Two',
        severity: 'MAJOR',
        type: 'VULNERABILITY',
        tags: [],
        langName: 'Java',
      },
    ]
    const result = formatRuleList(rules, 2)
    expect(result).toContain('Rules — 2 total')
    expect(result).toContain('🟠 java:S1')
    expect(result).toContain('🟡 java:S2')
    expect(result).toContain('Java')
  })

  it('should format component tree with missing measures', () => {
    const components: ComponentNode[] = [
      {
        key: 'proj:src/Empty.java',
        name: 'Empty.java',
        qualifier: 'FIL',
      },
    ]
    const result = formatComponentTree(components, 1, 'proj')
    expect(result).toContain('Empty.java')
    expect(result).toContain('—')
  })

  it('should format severity for unknown severity', () => {
    const result = formatSeverity('UNKNOWN')
    expect(result).toBe('⚪ UNKNOWN')
  })

  it('should format rating for unknown value', () => {
    const result = formatRating('6.0')
    expect(result).toBe('6.0')
  })

  it('should format quality gate status for unknown status', () => {
    const result = formatQualityGateStatus('NONE')
    expect(result).toBe('NONE')
  })
})
