import { createRenderer } from '../simpleDiff'
import { browserRendererOptions } from '../rendererOptions'

const vnode1 = {
  type: 'div',
  key: 111,
  children: [
    {type: 'p', children: '1', key: 1},
    {type: 'p', children: '2', key: 2},
    {type: 'p', children: '3', key: 3},
    {type: 'p', children: 'hello', key: 4},

  ]
}

const vnode2 = {
  type: 'div',
  key: 111,
  children: [
    {type: 'p', children: 'world', key: 5},
    {type: 'p', children: '33', key: 3},
    {type: 'p', children: '1', key: 1},
    {type: 'p', children: '2', key: 2},
  ]
}

const renderer = createRenderer(browserRendererOptions)

// 初次渲染
renderer.render(vnode1, document.querySelector('#root'))
// 更新
setTimeout(() => {
  renderer.render(vnode2, document.querySelector('#root'))
}, 1000)