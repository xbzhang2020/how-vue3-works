/**
 * 简单渲染器
 * 渲染器与响应式系统的结合
 */
import { ref, effect } from 'vue'

function renderer(domString, container) {
  container.innerHTML = domString
}

const count = ref(0)
effect(() => {
  renderer(`<p>count: ${count.value}</h1>`, document.getElementById('root'))
})

setTimeout(() => {
  count.value++
}, 1000)
