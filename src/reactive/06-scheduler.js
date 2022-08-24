/**
 * 在06基础上引入调度器
 */

const bucket = new WeakMap()
const effectStack = []
let activeEffect = null

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    effectStack.push(effectFn)
    activeEffect = effectFn
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  effectFn.deps = []
  effectFn.options = options
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
  const effectsToRun = new Set()

  deps &&
    deps.forEach((effectFn) => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })

  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

/**
 * 测试代码
 */
function test() {
  const data = { foo: 1 }
  const obj = reactive(data)

  effect(
    () => {
      console.log(obj.foo)
    },
    {
      scheduler(fn) {
        setTimeout(fn)
      },
    }
  )

  obj.foo++
  console.log('结束了')
}
test()
