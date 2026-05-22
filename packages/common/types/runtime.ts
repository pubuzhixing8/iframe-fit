import type { IframeResizeOptions } from './options'
import type { IframeResizeHandle } from './public'

export interface RegisteredIframe {
  id: string
  iframe: HTMLIFrameElement
  options: Required<IframeResizeOptions>
  iframeResize: IframeResizeHandle
}
