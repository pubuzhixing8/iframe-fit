export function assertIframeElement(value: unknown): asserts value is HTMLIFrameElement {
  if (!(value instanceof HTMLIFrameElement)) {
    throw new TypeError('Expected an HTMLIFrameElement')
  }
}
