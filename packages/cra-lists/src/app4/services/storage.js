export const storage = Storage()

function Storage() {
  const ls = global.window.localStorage
  return {
    get: k => {
      try {
        return JSON.parse(ls.getItem(k))
      } catch (e) {
        console.error(`storage.get`, e)
        return null
      }
    },
    set: (k, v) => {
      const value = JSON.stringify(v)
      ls.setItem(k, value)
      return value
    },
  }
}
