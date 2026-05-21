import type { IframeFitRef, IframeFitOptions } from "../common/index";
import { registerChildIframe } from "./runtime/registry";
import { normalizeOptions } from "./normalize-options";
import { type IframeFitTarget } from "./normalize-target";

export interface IframeFitElement extends HTMLIFrameElement {
  iframeFit?: IframeFitRef;
}

// This is the new parent entry point. In the legacy codebase, the equivalent
// responsibility lived in `packages/parent/factory.js`, where `createIframeResize()`
// validated the target collection and then delegated each iframe to
// `connectResizer(options)`.
export function iframeFit(target: IframeFitTarget): IframeFitElement {
  // `registerChildIframe()` is the new shell around the old `connectResizer(options)(iframe)`
  // path. Today it only records normalized state and attaches the public parent API.
  // Later this is where the real legacy/runtime bridge should be connected.
  const iframeFit = registerChildIframe(target);
  const fitIframe = target as IframeFitElement;
  fitIframe.iframeFit = iframeFit;
  return fitIframe;
}
