import { createRenderer, browserRendererOptions } from './04.js'

function test() {
  const vnode = {
    type: 'div',
    props: {
      id: 'foo',
      class: 'a b',
    },
    children: [
      {
        type: 'p',
        children: 'hello',
      },
    ],
  }

  // 渲染器
  const renderer = createRenderer(browserRendererOptions)
  // 第一次渲染：挂载
  renderer.render(vnode, document.getElementById('root'))

  // 第二次渲染：更新
  setTimeout(() => {
    renderer.render(vnode, document.getElementById('root'))
  }, 1000)

  // 第三次渲染：卸载
  setTimeout(() => {
    renderer.render(null, document.getElementById('root'))
  }, 2000)
}

test()
