import type { IframeResizeHandle } from '../common/index'
import { registerChildIframe } from './runtime/registry'

export type IframeResizeTarget = HTMLIFrameElement

export interface IframeResizeElement extends HTMLIFrameElement {
  iframeResizeHandle?: IframeResizeHandle
}

// This is the new parent entry point. In the legacy codebase, the equivalent
// responsibility lived in `
// validated the target collection and then delegated each iframe to
// `connectResizer(options)`.
export function bootstrapIframeResize(
  target: IframeResizeTarget,
): IframeResizeElement {
  // `registerChildIframe()` is the new shell around the old `connectResizer(options)(iframe)`
  // path. Today it only records normalized state and attaches the public parent API.
  // Later this is where the real legacy/runtime bridge should be connected.
  const iframeResizeHandle = registerChildIframe(target)
  const resizeIframe = target as IframeResizeElement
  resizeIframe.iframeResizeHandle = iframeResizeHandle
  return resizeIframe
}
