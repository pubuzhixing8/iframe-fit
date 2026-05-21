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
  id: string
  iframe: HTMLIFrameElement
}>

const registry = new Map<string, RegistryEntry>()

const IFRAME_FIT_ID_ATTR = 'data-iframe-fit-id'

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
  console.log('[iframe-fit][parent] send INIT', {
    id: entry.id,
    domId: entry.iframe.id,
    src: entry.iframe.src,
  })
  entry.iframe.contentWindow?.postMessage(
    encodeMessage<InitPayload>({
      id: entry.id,
      type: MessageType.INIT,
      payload: {},
    }),
    '*',
  )
}

function iframeListener(event: MessageEvent) {
  let message = event.data
  if (message === CHILD_READY_MESSAGE) {
    console.log('[iframe-fit][parent] received CHILD_READY_MESSAGE')
    // child iframe is ready in case child is not ready when parent is initialized
    if (typeof event.source !== 'object' || event.source == null) return
    registry.forEach((entry) => {
      if (entry.iframe.contentWindow === event.source) {
        console.log('[iframe-fit][parent] child ready matched iframe', {
          id: entry.id,
          domId: entry.iframe.id,
          src: entry.iframe.src,
        })
        sendInit(entry)
      }
    })
    return
  }
  const messageData = decodeMessage(message)
  if (!messageData) return
  console.log('[iframe-fit][parent] received message', messageData)
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
  if (!entry) {
    console.log('[iframe-fit][parent] setSize ignored - unknown iframe id', {
      id,
      payload,
    })
    return
  }

  const height = Number(payload?.height)
  const width = Number(payload?.width)
  if (!Number.isFinite(height) || !Number.isFinite(width)) {
    console.log('[iframe-fit][parent] setSize ignored - invalid size', {
      id,
      payload,
    })
    return
  }

  console.log('[iframe-fit][parent] setSize', { id, height, width })
  entry.iframe.style.height = `${height}px`
  entry.iframe.style.width = `${width}px`
}

export function registerChildIframe(iframe: HTMLIFrameElement): IframeFitRef {
  const id = iframe.getAttribute(IFRAME_FIT_ID_ATTR) || createIframeId()
  iframe.setAttribute(IFRAME_FIT_ID_ATTR, id)
  window.addEventListener(MESSAGE_EVENT, iframeListener)
  registry.set(id, { id, iframe })
  console.log('[iframe-fit][parent] register iframe', {
    id,
    domId: iframe.id,
    src: iframe.src,
  })
  if (
    iframe.contentWindow &&
    iframe.contentDocument &&
    iframe.contentDocument.readyState === 'complete'
  ) {
    sendInit({ id, iframe })
  } else {
    iframe.addEventListener('load', () => sendInit({ id, iframe }), {
      once: true,
    })
  }
  return setupIframeRef(iframe)
}
