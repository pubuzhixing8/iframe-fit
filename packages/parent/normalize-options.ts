import type { IframeResizeOptions } from '../common/index'
import { normalizeIframeResizeOptions } from './runtime/settings'

// Small bridge over the old `factory -> core` handoff. In the legacy flow the
// parent factory passed raw options into `connectResizer(options)`, which then
// merged defaults deeper inside core. Here we normalize up front so the new
// registry sees a stable shape.
export function normalizeOptions(options: IframeResizeOptions = {}) {
  return normalizeIframeResizeOptions(options)
}
