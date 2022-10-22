export interface VNode {
  key?: number | string
  type: string
  el?: Element
  props?: any
  children: string | null | VNode[]
}

export interface CreateRendererOption {
  createElement: (tag: string) => Element
  removeElement: (el: Element) => void
  setElementText: (el: Element, text: string) => void
  insert: (el: Element, parent: Element, anchor?: Element) => void
  patchProps: (el: Element, key: string, oldValue: any, newValue: any) => void
}

interface Element {
  _vnode?: VNode
}
