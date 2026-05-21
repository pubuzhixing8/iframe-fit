export type HeightCalculationMethod =
  | 'auto'
  | 'bodyOffset'
  | 'bodyScroll'
  | 'documentElementOffset'
  | 'documentElementScroll'
  | 'boundingClientRect'
  | 'max'
  | 'min'
  | 'grow'
  | 'lowestElement'
  | 'taggedElement'
  | 'custom'

export interface IframeFitOptions {
  autoResize?: boolean
  checkOrigin?: boolean | string[]
  heightCalculationMethod?: HeightCalculationMethod
}
