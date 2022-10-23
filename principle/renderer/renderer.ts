/**
 * 渲染器
 */
import type { CreateRendererOption, VNode } from './index'

function getSequence(arr: number[]) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}

export class Renderer {
  options: CreateRendererOption

  constructor(options: CreateRendererOption) {
    this.options = options
  }

  render(vnode: VNode, container: any) {
    if (vnode) {
      this.patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        this.unmount(container._vnode)
      }
    }
    // 存储当前 vnode，以供下次渲染时使用
    container._vnode = vnode
  }

  patch(n1: VNode | null, n2: VNode, container: Element) {
    if (n1 && n1.type !== n2.type) {
      this.unmount(n1)
      n1 = null
    }
    const { type } = n2

    if (typeof type === 'string') {
      if (!n1) {
        this.mountElement(n2, container)
      } else {
        this.patchElement(n1, n2, container)
      }
    }
  }

  mountElement(vnode: VNode, container: Element, anchor?: Element) {
    const el = (vnode.el = this.options.createElement(vnode.type))

    // 挂载属性
    if (vnode.props) {
      for (const key in vnode.props) {
        this.options.patchProps(el, key, null, vnode.props[key])
      }
    }

    // 挂载子节点
    if (typeof vnode.children === 'string') {
      this.options.setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((item) => {
        this.patch(null, item, el)
      })
    }

    this.options.insert(el, container, anchor)
  }

  patchElement(n1: VNode, n2: VNode, container: Element) {
    const el = (n2.el = n1.el)

    // 更新属性
    const oldProps = n1.props
    const newProps = n2.props
    for (const key in newProps) {
      this.options.patchProps(el, key, oldProps[key], newProps[key])
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        this.options.patchProps(el, key, oldProps[key], null)
      }
    }

    // 更新子节点
    this.patchChildren(n1, n2, el)
  }

  patchChildren(n1: VNode, n2: VNode, container: Element) {
    if (typeof n2.children === 'string') {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((item) => this.unmount(item))
      }
      this.options.setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
      if (Array.isArray(n1.children)) {
        // 暴力更新方法，确保功能可用
        // this.noDiff(n1, n2, container)

        // 简单 diff 算法
        // this.simpleDiff(n1, n2, container)

        // 双端 diff 算法
        // this.doubleEndDiff(n1, n2, container)

        // 快速 diff 算法
        this.quickDiff(n1, n2, container)
      } else {
        this.options.setElementText(container, '')
        n2.children.forEach((item) => this.patch(null, item, container))
      }
    } else {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((item) => this.unmount(item))
      } else if (typeof n1.children === 'string') {
        this.options.setElementText(container, '')
      }
    }
  }

  noDiff(n1: VNode, n2: VNode, container: Element) {
    const newChildren = n2.children as VNode[]
    const oldChildren = n1.children as VNode[]
    oldChildren.forEach((item) => this.unmount(item))
    newChildren.forEach((item) => this.mountElement(item, container))
  }

  simpleDiff(n1: VNode, n2: VNode, container: Element) {
    const newChildren = n2.children as VNode[]
    const oldChildren = n1.children as VNode[]
    let lastIndex = 0
    for (let i = 0; i < newChildren.length; i++) {
      let j = 0
      for (j = 0; j < oldChildren.length; j++) {
        if (newChildren[i].key === oldChildren[j].key) {
          // 找到可复用的节点
          this.patch(oldChildren[j], newChildren[i], container)
          // 更新元素的顺序
          if (j < lastIndex) {
            const prevVNode = newChildren[i - 1]
            if (prevVNode) {
              const anchor = prevVNode.el.nextSibling as unknown as Element
              this.options.insert(newChildren[i].el, container, anchor)
            }
          } else {
            lastIndex = j
          }
          break
        }
      }

      if (j >= oldChildren.length) {
        // 在新的一组子节点中未找到可复用的节点，则说明需要新添节点
        const prevVNode = newChildren[i - 1]
        let anchor = null
        if (prevVNode) {
          anchor = prevVNode.el.nextSibling
        } else {
          anchor = container.firstChild
        }
        this.mountElement(newChildren[i], container, anchor)
      }
    }

    for (let i = 0; i < oldChildren.length; i++) {
      const item = newChildren.find((newNode) => oldChildren[i].key === newNode.key)
      if (!item) {
        // 在旧的一组子节点中，为找到key值相同的元素，说明需要卸载
        this.unmount(oldChildren[i])
      }
    }
  }

  doubleEndDiff(n1: VNode, n2: VNode, container: Element) {
    const newChildren = n2.children as VNode[]
    const oldChildren = n1.children as VNode[]

    let newStartIndex = 0
    let newEndIndex = newChildren.length - 1
    let oldStartIndex = 0
    let oldEndIndex = oldChildren.length - 1

    while (newStartIndex <= newEndIndex && oldStartIndex <= oldEndIndex) {
      if (!oldChildren[oldStartIndex]) {
        oldStartIndex++
      } else if (!oldChildren[oldEndIndex]) {
        oldEndIndex--
      } else if (newChildren[newStartIndex].key === oldChildren[oldStartIndex].key) {
        this.patch(oldChildren[oldStartIndex++], newChildren[newStartIndex++], container)
      } else if (newChildren[newEndIndex].key === oldChildren[oldEndIndex].key) {
        this.patch(oldChildren[oldEndIndex--], newChildren[newEndIndex--], container)
      } else if (newChildren[newEndIndex].key === oldChildren[oldStartIndex].key) {
        this.patch(oldChildren[oldStartIndex], newChildren[newEndIndex], container)
        const anchor = oldChildren[oldEndIndex].el.nextSibling as unknown as Element
        this.options.insert(newChildren[newEndIndex].el, container, anchor)
        oldStartIndex++
        newEndIndex--
      } else if (newChildren[newStartIndex].key === oldChildren[oldEndIndex].key) {
        this.patch(oldChildren[oldEndIndex], newChildren[newStartIndex], container)
        const anchor = oldChildren[oldStartIndex].el
        this.options.insert(newChildren[newStartIndex].el, container, anchor)
        newStartIndex++
        oldEndIndex--
      } else {
        let oldIndex = oldChildren.findIndex((oldNode) => oldNode && newChildren[newStartIndex].key === oldNode.key)
        if (oldIndex > 0) {
          this.patch(oldChildren[oldIndex], newChildren[newStartIndex], container)
          oldChildren[oldIndex] = undefined
          const anchor = oldChildren[oldStartIndex].el
          this.options.insert(newChildren[newStartIndex++].el, container, anchor)
        } else {
          const anchor = oldChildren[oldStartIndex].el
          this.mountElement(newChildren[newStartIndex++], container, anchor)
        }
      }
    }

    if (newStartIndex <= newEndIndex && oldStartIndex > oldEndIndex) {
      for (let i = newStartIndex; i <= newEndIndex; i++) {
        const anchor = oldChildren[oldStartIndex].el
        this.mountElement(newChildren[i], container, anchor)
      }
    }

    if (oldStartIndex <= oldEndIndex && newStartIndex > newEndIndex) {
      for (let i = oldStartIndex; i <= oldEndIndex; i++) {
        if (oldChildren[i]) {
          this.unmount(oldChildren[i])
        }
      }
    }
  }

  quickDiff(n1: VNode, n2: VNode, container: Element) {
    const newChildren = n2.children as VNode[]
    const oldChildren = n1.children as VNode[]

    let newStartIndex = 0
    let newEndIndex = newChildren.length - 1
    let oldEndIndex = oldChildren.length - 1

    // 预处理前置节点
    while (
      newChildren[newStartIndex] &&
      oldChildren[newStartIndex] &&
      newChildren[newStartIndex].key === oldChildren[newStartIndex].key
    ) {
      this.patch(oldChildren[newStartIndex], newChildren[newStartIndex], container)
      newStartIndex++
    }

    // 刚好全部更新完毕，直接返回
    if (newStartIndex > newEndIndex && newStartIndex > oldEndIndex) {
      return
    }

    // 预处理后置节点
    while (
      newChildren[newEndIndex] &&
      oldChildren[oldEndIndex] &&
      newChildren[newEndIndex].key === oldChildren[oldEndIndex].key
    ) {
      this.patch(oldChildren[oldEndIndex], newChildren[newEndIndex], container)
      newEndIndex--
      oldEndIndex--
    }

    // 如果只有新的一组子节点有剩余
    if (newStartIndex <= newEndIndex && newStartIndex > oldEndIndex) {
      for (let i = newStartIndex; i <= newEndIndex; i++) {
        const anchor = oldChildren[newStartIndex].el
        this.mountElement(newChildren[i], container, anchor)
      }
      return
    }

    // 如果只有旧的一组子节点有剩余
    if (newStartIndex <= oldEndIndex && newStartIndex > newEndIndex) {
      for (let i = newStartIndex; i <= oldEndIndex; i++) {
        this.unmount(oldChildren[i])
      }
      return
    }

    // 新旧两组子节点都有剩余，先记录索引对应关系
    const count = newEndIndex - newStartIndex + 1 // 剩余未更新的子节点数量
    const source = new Array(count)
    source.fill(-1)
    const keyIndex = {}
    // 先遍历新的一组子节点，记录 key 值的 索引表
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      keyIndex[newChildren[i].key] = i
    }
    // 遍历旧的一组子节点，记录相同key值时，新的一组子节点的位置和旧的一组子节点的位置
    for (let i = newStartIndex; i <= oldEndIndex; i++) {
      const newIndex = keyIndex[oldChildren[i].key]
      if (newIndex) {
        // 可复用
        this.patch(oldChildren[i], newChildren[newIndex], container)
        source[newIndex - newStartIndex] = i
      } else {
        this.unmount(oldChildren[i])
      }
    }

    // 计算最长递增子序列
    const seq = getSequence(source)

    // 移动或挂载元素
    let s = seq.length - 1
    let i = count - 1
    for (; i > 0; i--) {
      const newIndex = i + newStartIndex
      const nextPos = newIndex + 1
      const anchor = nextPos < newChildren.length ? (newChildren[nextPos].el as unknown as Element) : null

      if (source[i] == -1) {
        // 没有对应的旧子节点索引，说明需要挂载元素
        this.mountElement(newChildren[newIndex], container, anchor)
      } else if (i != seq[s]) {
        // 在最长子序列中找不到对应的索引，说明移动元素顺序
        this.options.insert(newChildren[newIndex].el, container, anchor)
      } else {
        // 说说明不需要移动元素
        s--
      }
    }
  }

  unmount(vnode: VNode) {
    this.options.removeElement(vnode.el)
  }
}

export function createRenderer(options: CreateRendererOption) {
  return new Renderer(options)
}
