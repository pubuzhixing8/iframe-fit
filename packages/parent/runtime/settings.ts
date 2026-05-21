import type { IframeFitOptions } from '../../common/index'

export function normalizeIframeFitOptions(
  options: IframeFitOptions = {},
): Required<IframeFitOptions> {
  return {
    autoResize: options.autoResize ?? true,
    checkOrigin: options.checkOrigin ?? true,
    heightCalculationMethod: options.heightCalculationMethod ?? 'auto'
  }
}
