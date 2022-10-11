import { ref, effect } from 'vue'

/**
 * 渲染器
 */
export class Renderer {
  constructor() {}

  render(vnode, container) {}

  patch(n1, n2, container) {}
}

export function createRenderer() {
  return new Renderer()
}
