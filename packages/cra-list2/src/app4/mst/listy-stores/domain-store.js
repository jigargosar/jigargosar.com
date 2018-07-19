import {getSnapshot, types} from 'mobx-state-tree'
import {modelId} from '../../model/utils'
import {mValues} from '../../mobx/little-mobx'
import {applySnapshot2, mapSnapshot} from '../little-mst'
import {_, dotPath, isNotNil, modelsToIds} from '../../little-ramda'

const Item = types.model('Item', {
  id: types.identifier,
  text: '',
  done: false,
})

const views = self => ({
  get items() {
    return mValues(self.itemLookup)
  },
  get itemIds() {
    return modelsToIds(self.items)
  },
})
const DomainStore = types
  .model('DomainStore', {
    itemLookup: types.map(Item),
  })
  .views(views)
  .actions(self => ({
    addItem(values) {
      return self.itemLookup.put(
        Item.create({...values, id: modelId(Item.name)}),
      )
    },
    removeItem(itemId) {
      return self.itemLookup.delete(itemId)
    },
  }))

const store = DomainStore.create()

if (module.hot) {
  store.addItem()
  store.addItem({text: 'MoTu ToDOO'})
  store.removeItem(store.addItem().id)
  store.removeItem(store.addItem().id)
  store.removeItem(store.addItem().id)
  store.removeItem(store.addItem().id)
  store.addItem({text: 'FaDuu ToDOO'})

  const snap = dotPath('hot.data.snap')(module)
  _.when(isNotNil)(applySnapshot2(store))(snap)

  console.table(mapSnapshot(store.items))

  module.hot.dispose(data => (data.snap = getSnapshot(store)))
}

export default store
