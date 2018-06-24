export default {
  get: function(k) {
    try {
      return JSON.parse(window.localStorage.getItem(k))
    } catch (e) {
      return null
    }
  },
  set: function(k, v) {
    window.localStorage.setItem(k, JSON.stringify(v))
  },
}
