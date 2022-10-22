/**
 * 简单 DIFF 算法实现
 */
import type { CreateRendererOption, VNode, Element } from './index.d'

export class Renderer {
  options: CreateRendererOption

  constructor(options: CreateRendererOption) {
    this.options = options
  }

  render(vnode: VNode, container) {
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
    this.patchChildren(n1, n2, container)
  }

  patchChildren(n1: VNode, n2: VNode, container: Element) {
    if (typeof n2.children === 'string') {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((item) => this.unmount(item))
      }
      this.options.setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
      if (Array.isArray(n1.children)) {
        // 核心 DIFF 算法，先用暴力方法支持，确保功能可用
        n1.children.forEach((item) => this.unmount(item))
        n2.children.forEach((item) => this.patch(null, item, container))
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

  unmount(vnode: VNode) {
    this.options.removeElement(vnode.el)
  }
}

export function createRenderer(options: CreateRendererOption) {
  return new Renderer(options)
}

