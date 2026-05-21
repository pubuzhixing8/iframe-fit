export const MessageType = {
  INIT: 'init',
  RESIZE: 'resize',
  MESSAGE: 'message',
  CLOSE: 'close',
  PARENT_INFO: 'parentInfo',
  PAGE_INFO: 'pageInfo',
  RESET: 'reset',
  AUTO_RESIZE: 'autoResize',
} as const

export type MessageType = (typeof MessageType)[keyof typeof MessageType]
