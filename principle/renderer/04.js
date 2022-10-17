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
    if (!n1) {
      this.mount(n2, container)
    } else {
      // TODO: 更新 DOM
      console.log('update')
    }
  }

  mount(vnode, container) {
    const el = (vnode.el = this.options.createElement(vnode.type))
    if (typeof vnode.children === 'string') {
      this.options.setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((item) => {
        this.mount(item, el)
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
    if (key === 'class') {
      el.className = newValue || ''
    } else if (shouldSetAsProps(el, key)) {
      if (typeof el[key] === 'boolean' && newValue === '') {
        el[key] = true
      } else {
        el[key] = newValue
      }
    } else {
      el.setAttribute(key, newValue)
    }
  },
}
