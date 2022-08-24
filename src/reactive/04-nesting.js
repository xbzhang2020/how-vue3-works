/**
 * 在03基础上考虑嵌套
 */
const bucket = new WeakMap()
const effectStack = []
let activeEffect = null

function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    effectStack.push(effectFn)
    activeEffect = effectFn
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
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
  const data = { foo: true, bar: true }
  const obj = reactive(data)

  let temp1, temp2

  effect(() => {
    console.log('effectFn1 执行')
    effect(() => {
      console.log('effectFn2 执行')
      temp2 = obj.bar
    })
    temp1 = obj.foo
  })

  setTimeout(() => {
    obj.foo = false
    console.log(temp1, temp2)
  }, 100)
}
test()
