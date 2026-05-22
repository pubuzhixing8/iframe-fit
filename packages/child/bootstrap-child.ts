import {
  CHILD_READY_MESSAGE,
  decodeMessage,
  MESSAGE_EVENT,
  MessageType,
  READY_STATE_CHANGE,
} from '../common/index'
import { buildParentIframeHandle } from './parent-iframe-handle'
import { State } from './utils'
import { check } from './utils'
import { observeChild } from './observe-child'

// Legacy `child/index.js` does a lot more during init: parse parent settings,
// start observers, then expose `window.parentIframeHandle`. This bootstrap file marks
// the seam where those responsibilities will be reintroduced step by step.
export function bootstrapChild() {
  console.log('[iframe-resize][child] bootstrapChild')
  if ('iframeChildListener' in window) {
    console.warn('Already bootstrap')
  } else {
    const state: State = {
      sentReady: false,
      firstRun: true,
      teardown: [],
    }
    window.iframeChildListener = (data) => {}
    window.addEventListener(MESSAGE_EVENT, (event) =>
      iframeListener(event, state),
    )
    document.addEventListener(READY_STATE_CHANGE, () => ready(state))
    ready(state)
    window.parentIframeHandle = buildParentIframeHandle()
  }
}

function ready(state: State) {
  if (document.readyState === 'loading' || !state.firstRun || state.sentReady)
    return

  const { parent, top } = window

  sendReady(parent)
  if (parent !== top) sendReady(top)

  state.sentReady = true
}

function sendReady(target: Window | null) {
  if (!target) return
  console.log('[iframe-resize][child] send CHILD_READY_MESSAGE')
  target.postMessage(CHILD_READY_MESSAGE, '*')
}

function iframeListener(event: MessageEvent, state: State) {
  const { data } = event
  const messageData = decodeMessage(data)
  if (!messageData) return
  console.log('[iframe-resize][child] received message', messageData)
  switch (messageData.type) {
    case MessageType.init:
      init(event, state)
      break
    case MessageType.reset:
      break
    default:
      break
  }
}

function init(event: MessageEvent, state: State) {
  if (!check(state)) {
    return
  }
  if (document.readyState === 'loading') {
    return
  }
  console.log('[iframe-resize][child] init from parent')
  state.firstRun = false
  const msg = decodeMessage(event.data)
  if (msg && msg.type === MessageType.init) {
    state.iframeId = msg.id
  }
  if (event.source) state.parentWindow = event.source as Window
  state.parentOrigin = event.origin
  console.log('[iframe-resize][child] init context', {
    iframeId: state.iframeId,
    parentOrigin: state.parentOrigin,
  })
  observeChild(state)
}
