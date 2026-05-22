export interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
}

export type LoggerRole = 'parent' | 'child' | 'common'

export type LoggerState = {
  enabled: boolean
}

export type CreateLoggerInput = Readonly<{
  state: LoggerState
  role: LoggerRole
}>

const ROLE_COLORS: Record<LoggerRole, string> = {
  parent: '#a855f7',
  child: '#06b6d4',
  common: '#64748b',
}

function safeConsole(): Console | null {
  if (typeof console === 'undefined') return null
  return console
}

export function createLogger({ state, role }: CreateLoggerInput): Logger {
  const prefix = `[iframe-resize][${role}]`
  const labelStyle = `color: ${ROLE_COLORS[role]}; font-weight: 700;`
  const resetStyle = 'color: inherit; font-weight: inherit;'

  const print = (
    level: 'debug' | 'info' | 'warn',
    args: unknown[],
  ): void => {
    if (!state.enabled) return
    const c = safeConsole()
    if (!c) return
    const fn = (c[level] ?? c.log).bind(c)
    fn(`%c${prefix}%c`, labelStyle, resetStyle, ...args)
  }

  return {
    debug: (...args) => print('debug', args),
    info: (...args) => print('info', args),
    warn: (...args) => print('warn', args),
  }
}
