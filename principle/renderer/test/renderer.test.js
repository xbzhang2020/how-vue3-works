import { createRenderer, browserRendererOptions } from '../renderer.js'
import { ref, effect } from 'vue'

function test1() {
  const vnode = {
    type: 'div',
    props: {
      id: 'foo',
      class: 'a b',
      onClick: [() => console.log('1'), () => console.log('2')],
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

  //   // 第三次渲染：卸载
  //   setTimeout(() => {
  //     renderer.render(null, document.getElementById('root'))
  //   }, 2000)
}

function test2() {
  const bol = ref(false)
  const renderer = createRenderer(browserRendererOptions)

  effect(() => {
    const vnode = {
      type: 'div',
      props: bol.value
        ? {
            onClick: () => console.log('父元素 Clicked'),
          }
        : {},
      children: [
        {
          type: 'p',
          children: 'hello',
          props: {
            onClick: () => {
              bol.value = true
              console.log('子元素 Clicked')
            },
          },
        },
      ],
    }
    renderer.render(vnode, document.getElementById('root'))
  })
}

// test1()
test2()
