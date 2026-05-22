import type {
  Envelope,
  IframeResizeHandle,
  InitPayload,
  IframeResizeOptions,
  LoggerState,
  ResizePayload,
} from '../../common/index'
import {
  CHILD_READY_MESSAGE,
  createLogger,
  createIframeId,
  decodeMessage,
  encodeMessage,
  MESSAGE_EVENT,
  MessageType,
} from '../../common/index'

type RegistryEntry = Readonly<{
  id: string
  iframe: HTMLIFrameElement
  resizeWidth: boolean
  logEnabled: boolean
}>

const registry = new Map<string, RegistryEntry>()

const IFRAME_RESIZE_ID_ATTR = 'data-iframe-resize-id'
const IFRAME_RESIZE_RESIZE_WIDTH_ATTR = 'data-iframe-resize-width'

const parentLoggerState: LoggerState = { enabled: false }
const parentLogger = createLogger({ state: parentLoggerState, role: 'parent' })

function buildIframeHandle(iframe: HTMLIFrameElement): IframeResizeHandle {
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
  parentLogger.info('send INIT', {
    id: entry.id,
    domId: entry.iframe.id,
    src: entry.iframe.src,
  })
  entry.iframe.contentWindow?.postMessage(
    encodeMessage<InitPayload>({
      id: entry.id,
      type: MessageType.init,
      payload: { logEnabled: entry.logEnabled },
    }),
    '*',
  )
}

function iframeListener(event: MessageEvent) {
  let message = event.data
  if (message === CHILD_READY_MESSAGE) {
    parentLogger.debug('received CHILD_READY_MESSAGE')
    // child iframe is ready in case child is not ready when parent is initialized
    if (typeof event.source !== 'object' || event.source == null) return
    registry.forEach((entry) => {
      if (entry.iframe.contentWindow === event.source) {
        parentLogger.debug('child ready matched iframe', {
          id: entry.id,
          domId: entry.iframe.id,
          src: entry.iframe.src,
        })
        sendInit(entry)
      }
    })
    return
  }
  const messageData = decodeMessage(message, parentLogger)
  if (!messageData) return
  parentLogger.debug('received message', messageData)
  messageHandler(messageData)
}

function messageHandler(messageData: Envelope<unknown>) {
  const { type, id } = messageData
  switch (type) {
    case MessageType.init:
      break
    case MessageType.resize:
      setSize(id, messageData.payload as ResizePayload)
      break
    case MessageType.close:
      break
    case MessageType.message:
      break
    case MessageType.parentInfo:
      break
    case MessageType.pageInfo:
      break
    case MessageType.reset:
      break
    case MessageType.autoResize:
      break
    default:
      break
  }
}

function setSize(id: string, payload: ResizePayload) {
  const entry = registry.get(id)
  if (!entry) {
    parentLogger.debug('setSize ignored - unknown iframe id', {
      id,
      payload,
    })
    return
  }

  const height = Number(payload?.height)
  const width = Number(payload?.width)
  if (!Number.isFinite(height)) {
    parentLogger.debug('setSize ignored - invalid size', {
      id,
      payload,
    })
    return
  }

  parentLogger.debug('setSize', { id, height, width })
  entry.iframe.style.height = `${height}px`
  if (entry.resizeWidth && Number.isFinite(width) && width > 0) {
    entry.iframe.style.width = `${width}px`
  }
}

export function registerChildIframe(
  iframe: HTMLIFrameElement,
  options: Required<IframeResizeOptions>,
): IframeResizeHandle {
  parentLoggerState.enabled = parentLoggerState.enabled || options.log
  const id = iframe.getAttribute(IFRAME_RESIZE_ID_ATTR) || createIframeId()
  iframe.setAttribute(IFRAME_RESIZE_ID_ATTR, id)
  const resizeWidth =
    iframe.getAttribute(IFRAME_RESIZE_RESIZE_WIDTH_ATTR) === 'true'
  const entry = { id, iframe, resizeWidth, logEnabled: options.log } as const
  window.addEventListener(MESSAGE_EVENT, iframeListener)
  registry.set(id, entry)
  parentLogger.info('register iframe', {
    id,
    domId: iframe.id,
    src: iframe.src,
    resizeWidth,
  })
  if (
    iframe.contentWindow &&
    iframe.contentDocument &&
    iframe.contentDocument.readyState === 'complete'
  ) {
    sendInit(entry)
  } else {
    iframe.addEventListener('load', () => sendInit(entry), {
      once: true,
    })
  }
  return buildIframeHandle(iframe)
}
