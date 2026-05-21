import { encodeMessage } from '../common/index'
import type { Envelope } from '../common/index'

export type SendToParentInput<TPayload> = Readonly<{
  message: Envelope<TPayload>
  target?: Window | null
  targetOrigin?: string
}>

export function sendToParent<TPayload>({
  message,
  target,
  targetOrigin,
}: SendToParentInput<TPayload>): void {
  const win = target ?? window.parent
  if (!win) return
  win.postMessage(encodeMessage(message), targetOrigin ?? '*')
}

