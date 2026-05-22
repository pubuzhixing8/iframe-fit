export const IGNORE_ATTR = 'data-iframe-ignore' as const
export const SIZE_ATTR = 'data-iframe-size' as const
export const OVERFLOW_ATTR = 'data-iframe-overflowed' as const

export const IGNORE_TAGS = new Set([
  'head',
  'body',
  'meta',
  'base',
  'title',
  'script',
  'link',
  'style',
  'map',
  'area',
  'option',
  'optgroup',
  'template',
  'track',
  'wbr',
  'nobr',
])

