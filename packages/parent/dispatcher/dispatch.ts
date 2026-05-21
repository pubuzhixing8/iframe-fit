import type { Envelope } from '../../common/index'

export function dispatchMessage(message: Envelope, event: MessageEvent): void {
  window.dispatchEvent(
    new CustomEvent('iframe-fit:message', {
      detail: { message, event },
    }),
  )
}
