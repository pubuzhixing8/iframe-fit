import type { IframeFitRef, Envelope, InitPayload, ResizePayload } from '../../common/index'
import {
  CHILD_READY_MESSAGE,
  createIframeId,
  decodeMessage,
  encodeMessage,
  MESSAGE_EVENT,
  MessageType,
} from '../../common/index'

type RegistryEntry = Readonly<{
  iframe: HTMLIFrameElement
}>

const registry = new Map<string, RegistryEntry>()

function setupIframeRef(iframe: HTMLIFrameElement): IframeFitRef {
  return {
    sendMessage(message: unknown) {
      iframe.contentWindow?.postMessage(message, '*')
    },
    autoResize() {},
    close: () => iframe.remove(),
    disconnect: () => {},
    getParentProps() {
      return () => undefined
    },
  }
}

function sendInit(entry: RegistryEntry) {
  entry.iframe.contentWindow?.postMessage(
    encodeMessage<InitPayload>({
      id: entry.iframe.id,
      type: MessageType.INIT,
      payload: {},
    }),
    '*',
  )
}

function iframeListener(event: MessageEvent) {
  let message = event.data
  if (message === CHILD_READY_MESSAGE) {
    // child iframe is ready in case child is not ready when parent is initialized
    if (typeof event.source !== 'object' || event.source == null) return
    registry.forEach((entry) => {
      if (entry.iframe.contentWindow === event.source) sendInit(entry)
    })
    return
  }
  const messageData = decodeMessage(message)
  if (!messageData) return
  messageHandler(messageData)
}

function messageHandler(messageData: Envelope<unknown>) {
  const { type, id } = messageData
  switch (type) {
    case MessageType.INIT:
      break
    case MessageType.RESIZE:
      setSize(id, messageData.payload as ResizePayload)
      break
    case MessageType.CLOSE:
      break
    case MessageType.MESSAGE:
      break
    case MessageType.PARENT_INFO:
      break
    case MessageType.PAGE_INFO:
      break
    case MessageType.RESET:
      break
    case MessageType.AUTO_RESIZE:
      break
    default:
      break
  }
}

function setSize(id: string, payload: ResizePayload) {
  const entry = registry.get(id)
  if (!entry) return

  const height = Number(payload?.height)
  const width = Number(payload?.width)
  if (!Number.isFinite(height) || !Number.isFinite(width)) return

  entry.iframe.style.height = `${height}px`
  entry.iframe.style.width = `${width}px`
}

export function registerChildIframe(iframe: HTMLIFrameElement): IframeFitRef {
  const id = iframe.id || createIframeId()
  iframe.id = id
  window.addEventListener(MESSAGE_EVENT, iframeListener)
  registry.set(id, { iframe })
  if (
    iframe.contentWindow &&
    iframe.contentDocument &&
    iframe.contentDocument.readyState === 'complete'
  ) {
    sendInit({ iframe })
  } else {
    iframe.addEventListener('load', () => sendInit({ iframe }), {
      once: true,
    })
  }
  return setupIframeRef(iframe)
}
