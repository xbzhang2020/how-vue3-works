/**
 * 浏览器渲染器选项设置
 */

function shouldSetAsProps(el, key) {
  if (key === 'form' && el.tagName === 'INPUT') return false
  return key in el
}

export const browserRendererOptions = {
  // 创建元素
  createElement(tag) {
    return document.createElement(tag)
  },
  // 删除元素
  removeElement(el) {
    const parent = el.parentNode
    if (parent) {
      parent.removeChild(el)
    }
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
