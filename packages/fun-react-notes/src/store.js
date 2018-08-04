import {autorun, hotSnapshot} from './little-mst'
import RootStore from './RootStore'

const store = RootStore.create()

store.loadFromLS()
store.saveToLSOnSnapshotChange()

export default hotSnapshot(module)(store)

autorun(() => {
  console.log(`store.allNotes[0].isSelected`, store.allNotes[0].isSelected)
})

if (module.hot) {
  window.s = store
}
