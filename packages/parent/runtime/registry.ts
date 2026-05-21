import type { IframeFitRef, Envelope, InitPayload } from '../../common/index'
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
  const { type } = messageData
  switch (type) {
    case MessageType.INIT:
      break
    case MessageType.RESIZE:
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
