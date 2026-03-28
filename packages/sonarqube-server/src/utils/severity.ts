import type { Severity } from '../api/types.js'

export const SEVERITY_ICONS: Record<string, string> = {
  BLOCKER: '🔴',
  CRITICAL: '🟠',
  MAJOR: '🟡',
  MINOR: '🔵',
  INFO: '⚪',
}

export const SEVERITY_ORDER: Severity[] = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO']

export const RATING_LABELS: Record<string, string> = {
  '1.0': 'A',
  '2.0': 'B',
  '3.0': 'C',
  '4.0': 'D',
  '5.0': 'E',
}

export function formatRating(value: string): string {
  return RATING_LABELS[value] ?? value
}

export function formatSeverity(severity: string): string {
  const icon = SEVERITY_ICONS[severity] ?? '⚪'
  return `${icon} ${severity}`
}

export function formatQualityGateStatus(status: string): string {
  switch (status) {
    case 'OK':
      return '✅ PASSED'
    case 'ERROR':
      return '❌ FAILED'
    case 'WARN':
      return '⚠️ WARNING'
    default:
      return status
  }
}
