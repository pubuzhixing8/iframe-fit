import type { IframeResizeOptions } from './options'
import type { IframeResizeRef } from './public'

export interface RegisteredIframe {
  id: string
  iframe: HTMLIFrameElement
  options: Required<IframeResizeOptions>
  iframeResize: IframeResizeRef
}
