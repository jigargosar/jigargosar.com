import {extendObservable, oArray} from '../mobx/utils'
import {_} from '../utils'
import {collection} from 'mobx-app'
import {nanoid} from '../model/util'

const itemFactory = _.identity

const notesCollectionActions = state => {
  const itemActions = collection(state.nc.items, itemFactory)

  function foo() {
    console.log(`console`, 'foo')
  }

  function addNew() {
    itemActions.addItem({id: nanoid(), text: 'new note'})
  }
  return {addNew, foo, ...itemActions}
}
export const NC = (state, initialData) => {
  const items = _.pathOr([], ['nc', 'items'], initialData)
  extendObservable(state, {
    nc: {
      items: oArray(),
    },
  })
  const actions = notesCollectionActions(state)

  actions.setItems(items)

  return actions
}
