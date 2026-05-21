import { check } from "./check";
import { State } from "./state";
import { decodeMessage, MessageType } from "../common/index";
import {
  initChild,
  sendSize,
  setupEventListeners,
  setupMouseEvents,
} from "./init-child";

export const processRequestFromParent = {
  init: function initFromParent(event: MessageEvent, state: State) {
    if (!check(state)) {
      return;
    }
    if (document.readyState === "loading") {
      return;
    }
    console.log("[iframe-fit][child] init from parent");
    state.firstRun = false;
    const msg = decodeMessage(event.data);
    if (msg && msg.type === MessageType.INIT) {
      state.iframeId = msg.id;
    }
    if (event.source) state.parentWindow = event.source as Window;
    state.parentOrigin = event.origin;
    console.log("[iframe-fit][child] init context", {
      iframeId: state.iframeId,
      parentOrigin: state.parentOrigin,
    });
    initChild(state);
  },

  reset() {},

  resize() {},

  pageInfo() {},

  parentInfo() {},

  message() {},
};

export { initChild, sendSize, setupEventListeners, setupMouseEvents };
