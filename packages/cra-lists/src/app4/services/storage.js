function getLocalStorage() {
  return global.window.localStorage
}

export const storage = {
  get: k => {
    try {
      return JSON.parse(getLocalStorage().getItem(k))
    } catch (e) {
      console.error(`storage.get`, e)
      return null
    }
  },
  set: function(k, v) {
    global.window.localStorage.setItem(k, JSON.stringify(v))
  },
}
