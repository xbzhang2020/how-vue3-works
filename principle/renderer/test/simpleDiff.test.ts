import { createRenderer } from '../renderer'
import { browserRendererOptions } from '../rendererOptions'

const vnode1 = {
  type: 'div',
  key: 111,
  children: [
    { type: 'p', children: '1', key: 1 },
    { type: 'p', children: '2', key: 2 },
    { type: 'p', children: '3', key: 3 },
    { type: 'p', children: '4', key: 4 },
    { type: 'p', children: '6', key: 6 },
    { type: 'p', children: '5', key: 5 },
  ],
}

const vnode2 = {
  type: 'div',
  key: 111,
  children: [
    { type: 'p', children: '11', key: 1 },
    { type: 'p', children: '33', key: 3 },
    { type: 'p', children: '44', key: 4 },
    { type: 'p', children: '22', key: 2 },
    { type: 'p', children: '77', key: 7 },
    { type: 'p', children: '55', key: 5 },
  ],
}

const renderer = createRenderer(browserRendererOptions)

// 初次渲染
renderer.render(vnode1, document.querySelector('#root'))
// 更新
setTimeout(() => {
  console.log('rerender')
  renderer.render(vnode2, document.querySelector('#root'))
}, 1000)
