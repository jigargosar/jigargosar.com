import {types, getSnapshot} from 'mobx-state-tree'
import {modelId} from '../../model/utils'

const Item = types.model('Item', {
  id: types.identifier,
  text: '',
  done: false,
})

const DomainStore = types
  .model('DomainStore', {
    itemLookup: types.map(Item),
  })
  .actions(self => ({
    add() {
      self.itemLookup.put(Item.create({id: modelId(Item.name)}))
    },
  }))

const store = DomainStore.create()

store.add()
store.add()
store.add()

console.log(`store.itemLookup`, getSnapshot(store.itemLookup))

export default store
