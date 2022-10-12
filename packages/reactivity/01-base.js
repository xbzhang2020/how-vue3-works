/**
 * 最简单的响应式系统实现
 */

// 存储副作用的桶
const bucket = new Set()
// 一个全局变量， 指向当前调用的副作用函数
let activeEffect = null

// 副作用函数：用于注册副作用
export function effect(fn) {
  activeEffect = fn
  fn()
}

// 响应式函数：用于将数据变为响应式数据
export function reactive(data) {
  return new Proxy(data, {
    get(target, key, receiver) {
      // 收集副作用
      if (activeEffect) {
        bucket.add(activeEffect)
      }
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver)
      // 执行副作用
      bucket.forEach((fn) => fn())
      return res
    },
  })
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
