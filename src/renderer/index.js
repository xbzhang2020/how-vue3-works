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
