/**
 * 在02的基础上，考虑条件分支语句
 */
const bucket = new WeakMap()
let activeEffect = null

export function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
  }
  effectFn.deps = []
  effectFn()
}

function cleanup(effectFn) {
  if (!effectFn || !effectFn.deps) return

  effectFn.deps.forEach((effectDeps) => {
    effectDeps.delete(effectFn)
  })
  effectFn.deps.length = 0
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
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const deps = depsMap.get(key)
  const effectsToRun = new Set(deps)
  effectsToRun.forEach((fn) => fn())
}

/**
 * 测试代码
 */
function test() {
  const data = { ok: true, text: 'Hello World' }
  const obj = reactive(data)
  effect(() => {
    console.log('effect run')
    document.body.innerText = obj.ok ? obj.text : 'xxx'
  })

  setTimeout(() => {
    obj.ok = false
  }, 1000)
  setTimeout(() => {
    obj.text = 'Hello React'
  }, 2000)
}
test()
