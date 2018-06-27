import {extendObservable} from '../mobx/utils'

const notesCollectionActions = state => {
  function foo() {
    console.log(`console`, 'foo')
  }
  return {foo}
}
export const NC = (state, initialData) => {
  extendObservable(state, {
    nc: {
      idLookup: {},
    },
  })

  const actions = notesCollectionActions(state)
  return actions
}
