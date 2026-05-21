import { decodeMessage } from '../../common/index'
import { dispatchMessage } from './dispatch'

export function createMessageListener() {
  return (event: MessageEvent) => {
    const message = decodeMessage(event.data)
    if (!message) return
    dispatchMessage(message, event)
  }
}
