import {
  CHILD_READY_MESSAGE,
  decodeMessage,
  MESSAGE_EVENT,
  MessageType,
  READY_STATE_CHANGE,
} from "../common/index";
import { setupParentIframeHandle } from "./parent-iframe";
import { processRequestFromParent } from "./process-request-from-parent";
import { State } from "./state";

// Legacy `child/index.js` does a lot more during init: parse parent settings,
// start observers, then expose `window.parentIframe`. This bootstrap file marks
// the seam where those responsibilities will be reintroduced step by step.
export function bootstrapChild() {
  if ("iframeChildListener" in window) {
    console.warn("Already setup");
  } else {
    const state: State = {
      sent: false,
      firstRun: true,
      teardown: [],
    };
    window.iframeChildListener = (data) => {};
    window.addEventListener(MESSAGE_EVENT, (event) => received(event, state));
    document.addEventListener(READY_STATE_CHANGE, () => ready(state));
    ready(state);
  }
  window.parentIframe = setupParentIframeHandle();
}

function received(event: MessageEvent, state: State) {
  const { data } = event;
  const messageData = decodeMessage(data);
  if (!messageData) return;
  if (messageData.type === MessageType.INIT) {
    processRequestFromParent.init(event, state);
    return;
  }
  if (messageData.type === MessageType.RESET) {
    processRequestFromParent.reset();
    return;
  }
}

function ready(state: State) {
  if (document.readyState === "loading" || !state.firstRun || state.sent)
    return;

  const { parent, top } = window;

  sendReady(parent);
  if (parent !== top) sendReady(top);

  state.sent = true;
}

function sendReady(target: Window | null) {
  if (!target) return;
  target.postMessage(CHILD_READY_MESSAGE, "*");
}
