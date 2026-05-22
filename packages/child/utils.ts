import { encodeMessage } from '../common/index'
import type { Envelope } from '../common/index'

export type State = {
  sentReady: boolean
  firstRun: boolean
  teardown: Array<() => void>
  iframeId?: string
  parentWindow?: Window
  parentOrigin?: string
}

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

export const check = (state: State) => {
  return state.firstRun
}

