import {
  addDisposer,
  applySnapshot,
  model,
  onSnapshot,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'

const RootStore = model('RootStore', {})
  .actions(lsActions)
  .actions(self => ({
    initStore() {},
  }))

function lsActions(self) {
  const ls = StorageItem({name: 'rootSnapshot'})
  return {
    afterCreate() {},
    loadFromLS() {
      applySnapshot(self, ls.load())
    },
    reset() {
      applySnapshot(self, {})
    },
    saveToLSOnSnapshotChange() {
      addDisposer(self, onSnapshot(self, ls.save))
    },
  }
}

export default RootStore
