/**
 * 设置子节点和元素属性
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
        this.unmount(container._vnode)
      }
    }
    // 存储当前 vnode，以供下次渲染时使用
    container._vnode = vnode
  }

  patch(n1, n2, container) {
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

  patchElement(n1, n2, container) {
    const el = (n2.el = n1.el)
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

    this.patchChildren(n1, n2, container)
  }

  patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
      if (Array.isArray(n1.children)) {
        n1.children.forEach((item) => this.unmount(item))
      }
      this.options.setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
      if (Array.isArray(n1.children)) {
        // 核心 DIFF 算法
        // 暂时先用简单粗暴的方式支持，保证功能可用
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

  mountElement(vnode, container) {
    const el = (vnode.el = this.options.createElement(vnode.type))
    if (typeof vnode.children === 'string') {
      this.options.setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((item) => {
        this.patch(null, item, el)
      })
    }

    if (vnode.props) {
      for (const key in vnode.props) {
        this.options.patchProps(el, key, null, vnode.props[key])
      }
    }
    this.options.insert(el, container)
  }

  unmount(vnode) {
    const parent = vnode.el.parentNode
    if (parent) {
      parent.removeChild(vnode.el)
    }
  }
}

export function createRenderer(options) {
  return new Renderer(options)
}

function shouldSetAsProps(el, key) {
  if (key === 'form' && el.tagName === 'INPUT') return false
  return key in el
}

export const browserRendererOptions = {
  // 创建元素
  createElement(tag) {
    return document.createElement(tag)
  },
  // 设置元素的文本节点
  setElementText(el, text) {
    el.textContent = text
  },
  // 在指定容器上中插入元素
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
  // 为元素设置属性
  patchProps(el, key, oldValue, newValue) {
    if (/^on/.test(key)) {
      const name = key.slice(2).toLowerCase()
      let invoker = el._vei
      if (!invoker) {
        invoker = el._vei = (e) => {
          if (e.timeStamp < invoker.attached) return
          if (Array.isArray(invoker.value)) {
            invoker.value.forEach((fn) => fn(e))
          } else {
            invoker.value(e)
          }
        }
        invoker.attached = performance.now()
        invoker.value = newValue
        el.addEventListener(name, invoker)
      } else {
        invoker.value = newValue
      }
      return
    }

    if (key === 'class') {
      el.className = newValue || ''
      return
    }

    if (shouldSetAsProps(el, key)) {
      if (typeof el[key] === 'boolean' && newValue === '') {
        el[key] = true
      } else {
        el[key] = newValue
      }
      return
    }
    el.setAttribute(key, newValue)
  },
}
