import {extendObservable, oArray} from '../mobx/utils'
import {_} from '../utils'
import {collection, value} from 'mobx-app'

const itemFactory = _.identity

const notesCollectionActions = state => {
  const itemActions = collection(state.nc.items, itemFactory)

  function foo() {
    console.log(`console`, 'foo')
  }
  return {foo, ...itemActions}
}
export const NC = (state, initialData) => {
  const items = _.pathOr([], ['nc.items'], initialData)
  extendObservable(state, {
    nc: {
      items: oArray(),
    },
  })
  const actions = notesCollectionActions(state)

  actions.setItems(items)

  return actions
}
