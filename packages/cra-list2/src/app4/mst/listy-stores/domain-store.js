import {getSnapshot, types} from 'mobx-state-tree'
import {modelId} from '../../model/utils'
import {mValues} from '../../mobx/little-mobx'
import {applySnapshot2, mapSnapshot} from '../little-mst'
import {_, dotPath, isNotNil, modelsToIds} from '../../little-ramda'
import {Item} from './Item'

const DomainStore = types
  .model('DomainStore', {
    itemLookup: types.map(Item),
  })
  .views(views)
  .actions(actions)

function views(self) {
  return {
    get items() {
      return mValues(self.itemLookup)
    },
    get itemIds() {
      return modelsToIds(self.items)
    },
  }
}

function actions(self) {
  return {
    addItem(values) {
      return self.itemLookup.put(
        Item.create({...values, id: modelId(Item.name)}),
      )
    },
    deleteItem(item) {
      return self.itemLookup.delete(item.id)
    },
  }
}

const store = DomainStore.create()

if (module.hot) {
  store.addItem()
  store.addItem({text: 'MoTu ToDOO'})
  store.deleteItem(store.addItem())
  store.deleteItem(store.addItem())
  store.deleteItem(store.addItem())
  store.deleteItem(store.addItem())
  store.addItem({text: 'FaDuu ToDOO'})

  const snap = dotPath('hot.data.snap')(module)
  _.when(isNotNil)(applySnapshot2(store))(snap)

  console.table(mapSnapshot(store.items))

  module.hot.dispose(data => (data.snap = getSnapshot(store)))
}

export default store
