import { MessageType, createIframeId } from '../common/index'
import { sendToParent } from './utils'

export interface ParentIframeHandle {
  resize(): void
  sendMessage(message: unknown, targetOrigin?: string): void
  autoResize(value: boolean): void
  close(): void
  getParentProps(callback: (props: unknown) => void): () => void
}

declare global {
  interface Window {
    parentIframeHandle?: ParentIframeHandle
    iframeChildListener?: (data: unknown) => void
  }
}

// This mirrors the old `setupPublicMethods()` block from `packages/child/index.js`.
// In the legacy runtime that function created `window.parentIframe` and wired
// each method to the string-based message protocol. The new version keeps the
// same public surface, but routes through typed message helpers instead.
export function buildParentIframeHandle(): ParentIframeHandle {
  const id = createIframeId('child')

  const handle: ParentIframeHandle = {
    resize() {
      sendToParent({
        message: {
          id,
          type: MessageType.resize,
          payload: { reason: 'manual' },
        },
      })
    },
    sendMessage(message, targetOrigin) {
      sendToParent({
        message: { id, type: MessageType.message, payload: message },
        targetOrigin,
      })
    },
    autoResize(value) {
      sendToParent({
        message: { id, type: MessageType.autoResize, payload: { value } },
      })
    },
    close() {
      sendToParent({ message: { id, type: MessageType.close, payload: null } })
    },
    getParentProps(callback) {
      sendToParent({
        message: { id, type: MessageType.parentInfo, payload: null },
      })
      return () => callback(undefined)
    },
  }

  window.parentIframeHandle = handle
  return handle
}
