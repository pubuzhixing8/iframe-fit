import type { IframeFitOptions } from './options'
import type { IframeFitRef } from './public'

export interface RegisteredIframe {
  id: string
  iframe: HTMLIFrameElement
  options: Required<IframeFitOptions>
  iframeFit: IframeFitRef
}
