import RootStore from './RootStore'

const store = RootStore.create({}, {})

store.loadFromLS()
const disposer = store.saveToLSOnSnapshotChange()

store.ensureLogin()

setInterval(() => store.trySync(), 15 * 1000)

export default store

if (module.hot) {
  window.s = store
  module.hot.dispose(() => {
    try {
      disposer()
    } catch (e) {
      console.log('[store] destroy/dispose on hot dispose', e)
    }
  })
}
