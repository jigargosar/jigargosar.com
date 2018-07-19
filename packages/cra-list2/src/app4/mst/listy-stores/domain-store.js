import {types} from 'mobx-state-tree'
import {modelId} from '../../model/utils'
import {mValues} from '../../mobx/little-mobx'
import {mapSnapshot} from '../little-mst'

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

store.add()
store.add()
store.add()

console.table(mapSnapshot(store.items))

export default store
