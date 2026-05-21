import { check } from "./check";
import { State } from "./state";
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
    state.firstRun = false;
    initChild(state);
  },

  reset() {},

  resize() {},

  pageInfo() {},

  parentInfo() {},

  message() {},
};

export { initChild, sendSize, setupEventListeners, setupMouseEvents };
