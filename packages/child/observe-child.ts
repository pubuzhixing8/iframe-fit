import { MessageType, type ResizePayload } from '../common/index'
import { sendToParent } from './utils'
import { IGNORE_ATTR, IGNORE_TAGS, OVERFLOW_ATTR, SIZE_ATTR } from './constant'
import {
  createMutationObserver,
  type MutationObservedPayload,
} from './observers/mutation'
import type { State } from './utils'

export function setupEventListeners() {}

export function setupMouseEvents() {}

function stopInfiniteResizingOfIframe() {
  const setAutoHeight = (el: HTMLElement | null) => {
    if (!el) return
    el.style.setProperty('height', 'auto', 'important')
  }

  setAutoHeight(document.documentElement)
  setAutoHeight(document.body)
}

function calcMaxSize() {
  const elements = document.documentElement.querySelectorAll('*')

  let maxBottom = 0
  let maxRight = 0

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    const tagName = element.tagName.toLowerCase()
    if (IGNORE_TAGS.has(tagName)) continue
    if (element.closest(`[${IGNORE_ATTR}]`)) continue

    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)

    const bottom = rect.bottom + parseFloat(style.marginBottom || '0')
    if (bottom > maxBottom) maxBottom = bottom

    const right = rect.right + parseFloat(style.marginRight || '0')
    if (right > maxRight) maxRight = right
  }

  const height = Math.ceil(Math.max(maxBottom, 1))
  const width = Math.ceil(Math.max(maxRight, 1))

  return { height, width }
}

export function sendSize(state: State) {
  const id = state.iframeId ?? 'unknown'
  const target = state.parentWindow ?? window.parent
  if (!target) return

  const { height, width } = calcMaxSize()

  const targetOrigin =
    state.parentOrigin && state.parentOrigin !== 'null'
      ? state.parentOrigin
      : '*'

  console.log('[iframe-resize][child] sendSize', {
    id,
    height,
    width,
    targetOrigin,
  })

  sendToParent<ResizePayload>({
    message: {
      id,
      type: MessageType.resize,
      payload: { height, width },
    },
    target,
    targetOrigin,
  })
}

export function observeChild(state: State) {
  console.log('[iframe-resize][child] observeChild', {
    iframeId: state.iframeId,
  })
  stopInfiniteResizingOfIframe()
  let taggedElements: NodeListOf<Element> = document.querySelectorAll(
    `[${SIZE_ATTR}]`,
  )
  let overflowedElements = new Set<Element>()

  // 目标：把用户配置的 selector 映射到 DOM 上，打上 data 标记，让后续的“测量/忽略”逻辑有统一的输入信号。
  // 对比旧版：legacy `applySelectors()` 会读取 child 侧已解析出的 `sizeSelector/ignoreSelector`，然后对匹配元素 toggle `data-iframe-size` / `data-iframe-ignore`。
  const applySelectors = () => {
    const config =
      (window as unknown as { bootstrapIframeResize?: unknown })
        .bootstrapIframeResize ??
      (window as unknown as { setupIframeResizeChild?: unknown })
        .setupIframeResizeChild ??
      {}

    const sizeSelector =
      typeof (config as { sizeSelector?: unknown }).sizeSelector === 'string'
        ? ((config as { sizeSelector?: string }).sizeSelector ?? '')
        : ''

    const ignoreSelector =
      typeof (config as { ignoreSelector?: unknown }).ignoreSelector ===
      'string'
        ? ((config as { ignoreSelector?: string }).ignoreSelector ?? '')
        : ''

    if (sizeSelector) {
      document.querySelectorAll(sizeSelector).forEach((el) => {
        el.toggleAttribute(SIZE_ATTR, true)
      })
    }

    if (ignoreSelector) {
      document.querySelectorAll(ignoreSelector).forEach((el) => {
        el.toggleAttribute(IGNORE_ATTR, true)
      })
    }
  }

  // 目标：刷新 taggedElements/hasTags，用于后续“taggedElement”之类的尺寸计算策略（以及性能优化：只扫被标记的元素）。
  // 对比旧版：legacy `checkAndSetupTags()` 会维护 `taggedElements` 和 `hasTags`（并做日志），这里先保留状态更新。
  const checkAndSetupTags = () => {
    taggedElements = document.querySelectorAll(`[${SIZE_ATTR}]`)
    void taggedElements
  }

  // 目标：刷新 overflowedElements/hasOverflow（从 DOM 上已存在的 data-iframe-overflowed 读取）。
  // 对比旧版：legacy `checkOverflow()` 会结合 OverflowObserver 动态维护 `[data-iframe-overflowed]`，并过滤 ignore 区域；我们先做“读取 DOM 当前状态”的版本。
  const checkOverflow = () => {
    overflowedElements.clear()

    document.querySelectorAll(`[${OVERFLOW_ATTR}]`).forEach((el) => {
      if (el.closest(`[${IGNORE_ATTR}]`)) return
      overflowedElements.add(el)
    })
  }

  const contentMutated = (payload: MutationObservedPayload) => {
    applySelectors()
    checkAndSetupTags()
    checkOverflow()
    // 对比旧版：legacy `contentMutated()` 这里还会做：
    // - removeObservers(removedNodes)
    // - addObservers(addedNodes)
    // 用来把 DOM 变化同步给 ResizeObserver/OverflowObserver 等“基于元素列表”的观察器。
    // iframe-fit 这部分等迁移对应 observer 后再落位。
    void payload
  }

  const mutationObserved = (payload: MutationObservedPayload) => {
    console.log('[iframe-resize][child] mutationObserved', {
      added: payload.addedNodes.size,
      removed: payload.removedNodes.size,
    })
    contentMutated(payload)
    sendSize(state)
  }

  const attachObservers = () => {
    const mutationObserver = createMutationObserver(mutationObserved)
    state.teardown.push(mutationObserver.disconnect)
  }

  attachObservers()
  setupEventListeners()
  setupMouseEvents()
  sendSize(state)
}
