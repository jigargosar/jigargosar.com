import {extendObservable} from '../mobx/utils'
import {_} from '../utils'

const ncViewActions = state => {
  return {}
}

export const NCView = (state, initialData, namespace) => {
  // const items = _.pathOr([], [namespace, 'items'], initialData)
  extendObservable(state, {
    [namespace]: {
      get notes() {
        return state.notes
        // return state.notes.filter(_.propOr(false, 'deleted'))
      },
    },
  })
  const actions = ncViewActions(state[namespace])

  return actions
}
