/**
 * 通用渲染器渲染器：实现跨平台渲染
 */
export class Renderer {
  constructor(options) {
    this.options = options
  }

  render(vnode, container) {
    if (vnode) {
      this.patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        this.options.setElementText(container, '')
        console.log('unmmount')
      }
    }
    // 存储当前 vnode，以供下次渲染时使用
    container._vnode = vnode
  }

  patch(n1, n2, container) {
    if (!n1) {
      this.mountElement(n2, container)
      console.log('mount')
    } else {
      // TODO: 更新 DOM
      console.log('update')
    }
  }

  mountElement(vnode, container) {
    const el = this.options.createElement(vnode.type)
    if (typeof vnode.children === 'string') {
      this.options.setElementText(el, vnode.children)
    }
    this.options.insert(el, container)
  }
}

export function createRenderer(options) {
  return new Renderer(options)
}

export const browserRendererOptions = {
  // 创建元素
  createElement(tag) {
    return document.createElement(tag)
  },
  // 设置元素的文本节点
  setElementText(el, text) {
    return (el.textContent = text)
  },
  // 在指定容器上中插入元素
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
}
