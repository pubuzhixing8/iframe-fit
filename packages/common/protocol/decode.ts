import { MESSAGE_PREFIX } from './constants'
import type { Envelope } from './types'
import type { Logger } from '../utils/logger'

export function decodeMessage<T = unknown>(
  data: unknown,
  logger?: Logger,
): Envelope<T> | null {
  if (typeof data !== 'string' || !data.startsWith(MESSAGE_PREFIX)) {
    logger?.debug('ignored message format')
    return null
  }

  try {
    return JSON.parse(data.slice(MESSAGE_PREFIX.length)) as Envelope<T>
  } catch {
    return null
  }
}
