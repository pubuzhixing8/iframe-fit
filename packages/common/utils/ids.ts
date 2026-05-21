let counter = 0

export function createIframeId(prefix = 'iframe-fit'): string {
  counter += 1
  return `${prefix}-${counter}`
}
