import {
  addDisposer,
  applySnapshot,
  modelId,
  model,
  onSnapshot,
  types,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'

const OneDo = model('OneDo', {
  id: modelId('OneDo'),
  name: '',
})
const OneDoList = model('OneDoList', {
  id: modelId('OneDoList'),
  name: '',
  items: types.array(OneDo),
})

const RootStore = model('RootStore', {
  oneDoLists: types.array(OneDoList),
})
  .actions(lsActions)
  .actions(self => ({}))

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
