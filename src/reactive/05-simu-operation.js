/**
 * 在05基础上考虑同时操作
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
  // 为避免重新收集依赖引起的无限循环，需要拷贝依赖集合
  const effectsToRun = new Set(deps)
  effectsToRun.forEach((fn) => {
    // 为避免出现副作用函数无限递归调用自己，需要判断执行的副作用函数是否为当前副作用函数
    if (fn !== activeEffect) {
      fn()
    }
  })
}
/**
 * 测试代码
 */
function test() {
  const data = { foo: 1 }
  const obj = reactive(data)

  effect(() => {
    console.log(obj.foo)
  })

  effect(() => {
    obj.foo++
  })
}
test()
