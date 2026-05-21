export interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
}

export function createLogger(enabled = false): Logger {
  const noop = () => undefined

  if (!enabled) {
    return { debug: noop, info: noop, warn: noop }
  }

  return {
    debug: (...args) => console.debug('[iframe-fit]', ...args),
    info: (...args) => console.info('[iframe-fit]', ...args),
    warn: (...args) => console.warn('[iframe-fit]', ...args),
  }
}
