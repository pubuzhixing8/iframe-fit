import { IGNORE_ATTR, IGNORE_TAGS, SIZE_ATTR } from '../dom-attrs'

const DELAY = 16
const DELAY_MARGIN = 2
const DELAY_MAX = 200

export type MutationObservedPayload = Readonly<{
  addedNodes: ReadonlySet<Element>
  removedNodes: ReadonlySet<Element>
}>

export function createMutationObserver(
  callback: (payload: MutationObservedPayload) => void,
) {
  const addedNodes = new Set<Element>()
  const removedNodes = new Set<Element>()
  const removedAddedNodes = new Set<Element>()
  const queuedMutations: MutationRecord[][] = []

  const config: MutationObserverInit = {
    attributes: true,
    attributeFilter: [IGNORE_ATTR, SIZE_ATTR],
    attributeOldValue: false,
    characterData: false,
    characterDataOldValue: false,
    childList: true,
    subtree: true,
  }

  let delayCount = 1
  let pending = false
  let perfMon = 0

  const shouldSkip = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return true
    const tagName = (node as Element).tagName.toLowerCase()
    return IGNORE_TAGS.has(tagName)
  }

  const addedMutation = (mutation: MutationRecord) => {
    mutation.addedNodes.forEach((node) => {
      if (shouldSkip(node)) return
      addedNodes.add(node as Element)
    })
  }

  const removedMutation = (mutation: MutationRecord) => {
    mutation.removedNodes.forEach((node) => {
      if (shouldSkip(node)) return

      const element = node as Element
      if (addedNodes.has(element)) {
        addedNodes.delete(element)
        removedAddedNodes.add(element)
      } else {
        removedNodes.add(element)
      }
    })
  }

  const flattenMutations = (mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      addedMutation(mutation)
      removedMutation(mutation)
    }
    removedAddedNodes.clear()
  }

  const processMutations = () => {
    const now = performance.now()
    const delay = now - perfMon
    const delayLimit = DELAY * delayCount++ + DELAY_MARGIN

    if (delay > delayLimit && delay < DELAY_MAX) {
      setTimeout(processMutations, DELAY * delayCount)
      perfMon = now
      return
    }

    delayCount = 1

    for (const mutationBatch of queuedMutations) flattenMutations(mutationBatch)
    queuedMutations.length = 0
    pending = false

    callback({ addedNodes, removedNodes })

    addedNodes.clear()
    removedNodes.clear()
  }

  const mutationObserved: MutationCallback = (mutations) => {
    queuedMutations.push(mutations)
    if (pending) return

    perfMon = performance.now()
    pending = true
    requestAnimationFrame(processMutations)
  }

  const observer = new MutationObserver(mutationObserved)
  const target = document.body || document.documentElement
  observer.observe(target, config)

  return {
    disconnect: () => {
      addedNodes.clear()
      removedNodes.clear()
      removedAddedNodes.clear()
      queuedMutations.length = 0
      observer.disconnect()
    },
  }
}
