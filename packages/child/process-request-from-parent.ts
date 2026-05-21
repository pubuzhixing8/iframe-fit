import { check } from "./check";
import { State } from "./state";
import { createMutationObserver } from "./observers/mutation";

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

export function setupMouseEvents() {}

export function sendSize() {}

type MutationObservedPayload = Readonly<{
  addedNodes: ReadonlySet<Element>;
  removedNodes: ReadonlySet<Element>;
}>;

function mutationObserved(payload: MutationObservedPayload, _state: State) {
  // TODO: translate legacy `contentMutated()` pipeline (selectors/tags/overflow) step-by-step.
  void payload;
  sendSize();
}

function attachObservers(state: State) {
  const mutationObserver = createMutationObserver((payload) =>
    mutationObserved(payload, state),
  );

  state.teardown.push(mutationObserver.disconnect);
}

export function init(state: State) {
  attachObservers(state);
  setupEventListeners();
  setupMouseEvents();
  sendSize();
}
