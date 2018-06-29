import {extendObservable, oArray} from '../mobx/utils'
import {_} from '../utils'
import {collection} from 'mobx-app'
import {nanoid} from '../model/util'

const itemFactory = _.identity

const notesCollectionActions = state => {
  const itemActions = collection(state.items, itemFactory)

  function addNew() {
    itemActions.addItem({id: nanoid(), text: 'new note'})
  }
  return {addNew, _replace: itemActions.setItems}
}

export const NC = (state, initialData, namespace) => {
  const items = _.pathOr([], [namespace, 'items'], initialData)
  extendObservable(state, {
    [namespace]: {
      items: oArray(),
    },
  })
  const actions = notesCollectionActions(state[namespace])

  actions._replace(items)

  return actions
}
