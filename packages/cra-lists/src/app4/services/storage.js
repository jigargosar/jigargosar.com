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
    set: function(k, v) {
      ls.setItem(k, JSON.stringify(v))
    },
  }
}
