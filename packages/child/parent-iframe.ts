import { MessageType, createIframeId } from '../common/index'
import type { MessageType as MessageKind } from '../common/index'
import { sendToParent } from './send-to-parent'

export interface ParentIframe {
  resize(): void
  sendMessage(message: unknown, targetOrigin?: string): void
  autoResize(value: boolean): void
  close(): void
  getParentProps(callback: (props: unknown) => void): () => void
}

declare global {
  interface Window {
    parentIframe?: ParentIframe
    iframeChildListener?: (data: unknown) => void
  }
}

// This mirrors the old `setupPublicMethods()` block from `packages/child/index.js`.
// In the legacy runtime that function created `window.parentIframe` and wired
// each method to the string-based message protocol. The new version keeps the
// same public surface, but routes through typed message helpers instead.
export function setupParentIframeHandle(): ParentIframe {
  const id = createIframeId('child')

  const api: ParentIframe = {
    resize() {
      sendToParent({
        message: { id, type: MessageType.RESIZE, payload: { reason: 'manual' } },
      })
    },
    sendMessage(message, targetOrigin) {
      sendToParent({
        message: { id, type: MessageType.MESSAGE, payload: message },
        targetOrigin,
      })
    },
    autoResize(value) {
      sendToParent({
        message: { id, type: MessageType.AUTO_RESIZE, payload: { value } },
      })
    },
    close() {
      sendToParent({ message: { id, type: MessageType.CLOSE, payload: null } })
    },
    getParentProps(callback) {
      sendToParent({ message: { id, type: MessageType.PARENT_INFO, payload: null } })
      return () => callback(undefined)
    },
  }

  window.parentIframe = api
  return api
}
