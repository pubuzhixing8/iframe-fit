let counter = 0

export function createIframeId(prefix = 'iframe-resize'): string {
  counter += 1
  return `${prefix}-${counter}`
}
