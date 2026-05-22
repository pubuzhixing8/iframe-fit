import type { IframeResizeOptions } from '../../common/index'

export function normalizeIframeResizeOptions(
  options: IframeResizeOptions = {},
): Required<IframeResizeOptions> {
  return {
    autoResize: options.autoResize ?? true,
    checkOrigin: options.checkOrigin ?? true,
    heightCalculationMethod: options.heightCalculationMethod ?? 'auto'
  }
}
