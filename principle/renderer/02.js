/**
 * 基础渲染器渲染器
 */
export class Renderer {
  constructor() {}

  render(vnode, container) {
    if (vnode) {
      // 打补丁
      this.patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        // 卸载
        container.innerHTML = ''
        console.log('unmmount')
      }
    }
    // 存储当前 vnode，以供下次渲染时使用
    container._vnode = vnode
  }

  patch(n1, n2, container) {
    if (!n1) {
      // 挂载
      this.mountElement(n2, container)
      console.log('mount')
    } else {
      // 更新
      // TODO:
      console.log('update')
    }
  }

  mountElement(vnode, container) {
    const el = document.createElement(vnode.type)
    if (typeof vnode.children === 'string') {
      el.innerHTML = vnode.children
    }
    container.appendChild(el)
  }
}

export function createRenderer() {
  return new Renderer()
}
