import type { MessageType } from './message-types'

export interface Envelope<T = unknown> {
  id: string
  type: MessageType
  payload: T
  version: string
  origin?: string
}
