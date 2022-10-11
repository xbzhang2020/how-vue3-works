/**
 * 在01的基础上，使用 WeakMap<target, Map<key, Set<effect>>> 数据结构来构造桶
 */
const bucket = new WeakMap()
let activeEffect = null

export function effect(fn) {
  activeEffect = fn
  fn()
}

export function reactive(data) {
  return new Proxy(data, {
    get(target, key) {
      tracker(target, key)
      return Reflect.get(...arguments)
    },
    set(target, key) {
      const res = Reflect.set(...arguments)
      trigger(target, key)
      return res
    },
  })
}

function tracker(target, key) {
  if (!activeEffect) return

  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }

  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const deps = depsMap.get(key)
  deps && deps.forEach((fn) => fn())
}

/**
 * 测试代码
 */
function test() {
  const data = { ok: true, text: 'Hello World' }
  const obj = reactive(data)

  effect(() => {
    console.log('effect run')
    document.body.innerText = obj.text
  })

  setTimeout(() => {
    obj.text = 'Hello Vue3'
  }, 1000)
  setTimeout(() => {
    obj.notExist = 'Hello Vue3'
  }, 1000)
}
test()
