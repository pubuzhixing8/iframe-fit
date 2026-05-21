import { check } from "./check";
import { State } from "./state";

export const processRequestFromParent = {
  init: function initFromParent(event: MessageEvent, state: State) {
    if (!check(state)) {
      return;
    }
    if (document.readyState === "loading") {
      return;
    }
    state.firstRun = false;
    init(state);
  },

  reset() {},

  resize() {},

  pageInfo() {},

  parentInfo() {},

  message() {},
};

export function setupEventListeners() {}

function setupMouseEvents() {}

function sendSize() {}

export function init(state: State) {
  setupEventListeners();
  setupMouseEvents();
  sendSize();
}
