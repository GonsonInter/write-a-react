window.requestIdleCallback =
  window.requestIdleCallback ||
  ((callback) => {
    const start = Date.now()

    /** 用 setTimeout 模拟了一个 idleCallback */
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => {
          return Math.max(0, 50 - (Date.now() - start))
        }
      })
    }, 1)
  })

window.cancelIdleCallback = (id) => {
  clearTimeout(id)
}