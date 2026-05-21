import { MessageType, PROTOCOL_VERSION, encodeMessage, createIframeId } from '../common/index'
import type { MessageType as MessageKind } from '../common/index'

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

  const send = (type: MessageKind, payload: unknown, targetOrigin = '*') => {
    window.parent?.postMessage(
      encodeMessage({
        id,
        type,
        payload,
        version: PROTOCOL_VERSION,
      }),
      targetOrigin,
    )
  }

  const api: ParentIframe = {
    resize() {
      send(MessageType.RESIZE, { reason: 'manual' })
    },
    sendMessage(message, targetOrigin) {
      send(MessageType.MESSAGE, message, targetOrigin)
    },
    autoResize(value) {
      send(MessageType.AUTO_RESIZE, { value })
    },
    close() {
      send(MessageType.CLOSE, null)
    },
    getParentProps(callback) {
      send(MessageType.PARENT_INFO, null)
      return () => callback(undefined)
    },
  }

  window.parentIframe = api
  return api
}
