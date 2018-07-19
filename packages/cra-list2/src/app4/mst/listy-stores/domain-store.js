import {getSnapshot, types} from 'mobx-state-tree'
import {modelId} from '../../model/utils'
import {mValues} from '../../mobx/little-mobx'
import {applySnapshot2, mapSnapshot} from '../little-mst'
import {_, dotPath, isNotNil} from '../../little-ramda'

const Item = types.model('Item', {
  id: types.identifier,
  text: '',
  done: false,
})

const views = self => ({
  get items() {
    return mValues(self.itemLookup)
  },
})
const DomainStore = types
  .model('DomainStore', {
    itemLookup: types.map(Item),
  })
  .views(views)
  .actions(self => ({
    add() {
      self.itemLookup.put(Item.create({id: modelId(Item.name)}))
    },
  }))

const store = DomainStore.create()

if (module.hot) {
  store.add()
  store.add()

  const snap = dotPath('hot.data.snap')(module)
  _.when(isNotNil)(applySnapshot2(store))(snap)

  console.table(mapSnapshot(store.items))

  module.hot.dispose(data => (data.snap = getSnapshot(store)))
}

export default store
