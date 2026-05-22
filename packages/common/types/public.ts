export interface IframeResizeRef {
  sendMessage(message: unknown, targetOrigin?: string): void
  autoResize(value: boolean): void
  close(): void
  disconnect(): void
  getParentProps(callback: (props: unknown) => void): () => void
}
