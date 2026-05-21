import { MESSAGE_PREFIX } from './constants'
import type { Envelope } from './types'

export function encodeMessage<T>(message: Envelope<T>): string {
  return `${MESSAGE_PREFIX}${JSON.stringify(message)}`
}
