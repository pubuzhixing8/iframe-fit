export const MessageType = {
  init: 'init',
  resize: 'resize',
  message: 'message',
  close: 'close',
  parentInfo: 'parentInfo',
  pageInfo: 'pageInfo',
  reset: 'reset',
  autoResize: 'autoResize',
} as const

export type MessageType = (typeof MessageType)[keyof typeof MessageType]
