import { SEVERITY_ICONS, formatRating, formatQualityGateStatus } from './severity.js'
import type {
  Project,
  Issue,
  QualityGateStatus,
  QualityGateCondition,
  Hotspot,
  Measure,
  MeasureHistory,
  Rule,
  ComponentNode,
} from '../api/types.js'

function progressBar(pct: number, width = 10): string {
  const filled = Math.round((pct / 100) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function sparkline(values: number[]): string {
  if (values.length === 0) return ''
  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values.map((v) => chars[Math.min(Math.round(((v - min) / range) * 7), 7)] ?? '▁').join('')
}

export function formatProjectList(projects: Project[], baseUrl: string): string {
  const lines: string[] = [`SonarQube Projects (${new URL(baseUrl).host})`, '']
  lines.push(`${'Project'.padEnd(30)} ${'Key'.padEnd(25)} ${'Last Analysis'}`)
  lines.push('━'.repeat(75))

  for (const p of projects) {
    const date = p.lastAnalysisDate
      ? new Date(p.lastAnalysisDate).toISOString().slice(0, 16).replace('T', ' ')
      : 'Never'
    lines.push(`${p.name.slice(0, 29).padEnd(30)} ${p.key.slice(0, 24).padEnd(25)} ${date}`)
  }

  lines.push('')
  lines.push(`${projects.length} projects`)
  return lines.join('\n')
}

export function formatProjectOverview(
  project: Project,
  measures: Array<{ metric: string; value: string }>,
  gateStatus?: QualityGateStatus,
): string {
  const lines: string[] = [`Project: ${project.name} (${project.key})`, '']

  if (gateStatus) {
    lines.push(`Quality Gate: ${formatQualityGateStatus(gateStatus.status)}`)
  }
  if (project.lastAnalysisDate) {
    lines.push(
      `Last Analysis: ${new Date(project.lastAnalysisDate).toISOString().slice(0, 16).replace('T', ' ')}`,
    )
  }
  if (project.version) {
    lines.push(`Version: ${project.version}`)
  }

  lines.push('')
  lines.push('Key Metrics:')

  const mMap = new Map(measures.map((m) => [m.metric, m.value]))

  const ncloc = mMap.get('ncloc')
  if (ncloc) lines.push(`  Lines of Code:     ${Number(ncloc).toLocaleString()}`)

  const cov = mMap.get('coverage')
  if (cov) {
    const pct = parseFloat(cov)
    lines.push(`  Coverage:          ${pct.toFixed(1)}% ${progressBar(pct)}`)
  }

  const dup = mMap.get('duplicated_lines_density')
  if (dup) {
    const pct = parseFloat(dup)
    lines.push(`  Duplications:      ${pct.toFixed(1)}% ${progressBar(pct)}`)
  }

  const debt = mMap.get('sqale_index')
  if (debt) {
    const mins = parseInt(debt, 10)
    const days = Math.floor(mins / 480)
    const hours = Math.floor((mins % 480) / 60)
    lines.push(`  Tech Debt:         ${days}d ${hours}h`)
  }

  for (const [key, label] of [
    ['reliability_rating', 'Reliability'],
    ['security_rating', 'Security'],
    ['sqale_rating', 'Maintainability'],
  ] as const) {
    const val = mMap.get(key)
    if (val) lines.push(`  ${label.padEnd(18)} ${formatRating(val)}`)
  }

  lines.push('')
  lines.push('Issues Summary:')
  const bugs = mMap.get('bugs') ?? '0'
  const vulns = mMap.get('vulnerabilities') ?? '0'
  const smells = mMap.get('code_smells') ?? '0'
  lines.push(`  🐛 Bugs: ${bugs}    🔓 Vulnerabilities: ${vulns}    💩 Code Smells: ${smells}`)

  return lines.join('\n')
}

export function formatIssueList(issues: Issue[], total: number): string {
  const lines: string[] = [`Issues — ${total} total`, '']

  // Severity summary
  const counts: Record<string, number> = {}
  for (const i of issues) {
    counts[i.severity] = (counts[i.severity] ?? 0) + 1
  }
  const summary = Object.entries(SEVERITY_ICONS)
    .map(([sev, icon]) => `${icon} ${sev} (${counts[sev] ?? 0})`)
    .join(' | ')
  lines.push(summary)
  lines.push('')

  for (const issue of issues) {
    const icon = SEVERITY_ICONS[issue.severity] ?? '⚪'
    lines.push(`${icon} ${issue.severity} — ${issue.type}`)
    lines.push(`  Rule: ${issue.rule}`)
    const file = issue.component.split(':').pop() ?? issue.component
    lines.push(`  File: ${file}${issue.line ? `:${issue.line}` : ''}`)
    lines.push(`  Message: ${issue.message}`)
    lines.push(
      `  Created: ${issue.creationDate.slice(0, 10)} | Status: ${issue.status}${issue.effort ? ` | Effort: ${issue.effort}` : ''}`,
    )
    if (issue.tags.length > 0) lines.push(`  Tags: ${issue.tags.join(', ')}`)
    lines.push('')
  }

  return lines.join('\n')
}

export function formatIssueDetail(issue: Issue): string {
  const icon = SEVERITY_ICONS[issue.severity] ?? '⚪'
  const file = issue.component.split(':').pop() ?? issue.component
  const lines = [
    `${icon} ${issue.severity} — ${issue.type}`,
    `Key: ${issue.key}`,
    `Rule: ${issue.rule}`,
    `File: ${file}${issue.line ? `:${issue.line}` : ''}`,
    `Message: ${issue.message}`,
    `Status: ${issue.status}`,
    `Created: ${issue.creationDate}`,
  ]
  if (issue.effort) lines.push(`Effort: ${issue.effort}`)
  if (issue.author) lines.push(`Author: ${issue.author}`)
  if (issue.tags.length > 0) lines.push(`Tags: ${issue.tags.join(', ')}`)
  return lines.join('\n')
}

export function formatQualityGate(status: QualityGateStatus, projectName?: string): string {
  const header = projectName
    ? `Quality Gate: ${formatQualityGateStatus(status.status)} — ${projectName}`
    : `Quality Gate: ${formatQualityGateStatus(status.status)}`

  const lines: string[] = [header, '']

  const failed = status.conditions.filter((c) => c.status === 'ERROR')
  const warned = status.conditions.filter((c) => c.status === 'WARN')
  const passed = status.conditions.filter((c) => c.status === 'OK')

  const formatCondition = (c: QualityGateCondition, icon: string) => {
    const op = c.comparator === 'GT' ? '<' : '>'
    return `  ${icon} ${c.metricKey}: ${c.actualValue} (target: ${op} ${c.errorThreshold})`
  }

  if (failed.length > 0) {
    lines.push('Failed Conditions:')
    for (const c of failed) lines.push(formatCondition(c, '❌'))
    lines.push('')
  }
  if (warned.length > 0) {
    lines.push('Warning Conditions:')
    for (const c of warned) lines.push(formatCondition(c, '⚠️'))
    lines.push('')
  }
  if (passed.length > 0) {
    lines.push('Passed Conditions:')
    for (const c of passed) lines.push(formatCondition(c, '✅'))
  }

  return lines.join('\n')
}

export function formatHotspotList(hotspots: Hotspot[], total: number): string {
  const lines: string[] = [`Security Hotspots — ${total} total`, '']

  for (const h of hotspots) {
    const file = h.component.split(':').pop() ?? h.component
    lines.push(`[${h.vulnerabilityProbability}] ${h.status} — ${h.securityCategory}`)
    lines.push(`  File: ${file}${h.line ? `:${h.line}` : ''}`)
    lines.push(`  Message: ${h.message}`)
    lines.push(`  Key: ${h.key}`)
    lines.push('')
  }

  return lines.join('\n')
}

export function formatHotspotDetail(hotspot: Hotspot): string {
  const file = hotspot.component.split(':').pop() ?? hotspot.component
  const lines = [
    `Security Hotspot: ${hotspot.key}`,
    `Category: ${hotspot.securityCategory}`,
    `Probability: ${hotspot.vulnerabilityProbability}`,
    `Status: ${hotspot.status}${hotspot.resolution ? ` (${hotspot.resolution})` : ''}`,
    `File: ${file}${hotspot.line ? `:${hotspot.line}` : ''}`,
    `Message: ${hotspot.message}`,
    `Created: ${hotspot.creationDate}`,
  ]
  if (hotspot.author) lines.push(`Author: ${hotspot.author}`)
  return lines.join('\n')
}

export function formatMeasures(measures: Measure[], projectKey: string): string {
  const lines: string[] = [`Measures for ${projectKey}`, '']

  for (const m of measures) {
    lines.push(`  ${m.metric}: ${m.value ?? 'N/A'}`)
  }

  return lines.join('\n')
}

export function formatMeasuresHistory(histories: MeasureHistory[], projectKey: string): string {
  const lines: string[] = [`Metrics History: ${projectKey}`, '']

  for (const mh of histories) {
    lines.push(`${mh.metric}:`)
    lines.push(`${'Date'.padEnd(14)} ${'Value'.padEnd(10)} Trend`)
    lines.push('━'.repeat(35))

    const values = mh.history.map((h) => parseFloat(h.value) || 0)
    const spark = sparkline(values)

    for (let i = 0; i < mh.history.length; i++) {
      const h = mh.history[i]!
      const prev = i > 0 ? parseFloat(mh.history[i - 1]!.value) : null
      const cur = parseFloat(h.value)
      let trend = ''
      if (prev !== null) {
        const diff = cur - prev
        trend = diff > 0 ? `+${diff.toFixed(1)}%` : diff < 0 ? `${diff.toFixed(1)}%` : '0.0%'
      }
      lines.push(`${h.date.slice(0, 10).padEnd(14)} ${h.value.padEnd(10)} ${trend}`)
    }

    lines.push(`Sparkline: ${spark}`)
    if (values.length >= 2) {
      const change = values[values.length - 1]! - values[0]!
      lines.push(
        `Overall change: ${change > 0 ? '+' : ''}${change.toFixed(1)} over ${values.length} data points`,
      )
    }
    lines.push('')
  }

  return lines.join('\n')
}

export function formatRule(rule: Rule): string {
  const lines = [
    `Rule: ${rule.key} — ${rule.name}`,
    '',
    `Type: ${rule.type} | Severity: ${rule.severity}${rule.langName ? ` | Language: ${rule.langName}` : ''}`,
  ]
  if (rule.tags.length > 0) lines.push(`Tags: ${rule.tags.join(', ')}`)
  if (rule.mdDesc) {
    lines.push('')
    lines.push('Description:')
    lines.push(rule.mdDesc)
  }
  if (rule.remFnBaseEffort) lines.push(`\nRemediation: ${rule.remFnBaseEffort}`)
  return lines.join('\n')
}

export function formatRuleList(rules: Rule[], total: number): string {
  const lines: string[] = [`Rules — ${total} total`, '']

  for (const r of rules) {
    const icon = SEVERITY_ICONS[r.severity] ?? '⚪'
    lines.push(`${icon} ${r.key} — ${r.name}`)
    lines.push(
      `   Type: ${r.type} | Severity: ${r.severity}${r.langName ? ` | ${r.langName}` : ''}`,
    )
    lines.push('')
  }

  return lines.join('\n')
}

export function formatComponentTree(
  components: ComponentNode[],
  _total: number,
  projectKey: string,
): string {
  const lines: string[] = [`Component Tree: ${projectKey}`, '']

  lines.push(
    `${'Path'.padEnd(45)} ${'Lines'.padEnd(7)} ${'Coverage'.padEnd(10)} ${'Bugs'.padEnd(5)} ${'Vulns'.padEnd(6)} Smells`,
  )
  lines.push('━'.repeat(85))

  for (const c of components) {
    const mMap = new Map((c.measures ?? []).map((m) => [m.metric, m.value ?? '—']))
    const path = (c.path ?? c.name).slice(0, 44).padEnd(45)
    const ncloc = (mMap.get('ncloc') ?? '—').padEnd(7)
    const cov = (
      mMap.get('coverage') ? `${parseFloat(mMap.get('coverage')!).toFixed(1)}%` : '—'
    ).padEnd(10)
    const bugs = (mMap.get('bugs') ?? '—').padEnd(5)
    const vulns = (mMap.get('vulnerabilities') ?? '—').padEnd(6)
    const smells = mMap.get('code_smells') ?? '—'
    lines.push(`${path} ${ncloc} ${cov} ${bugs} ${vulns} ${smells}`)
  }

  return lines.join('\n')
}
