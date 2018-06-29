import {
  createTransformer,
  extendObservable,
  mAction,
  oArray,
  oObject,
} from '../mobx/utils'
import {_} from '../utils'
import {nanoid} from '../model/util'

const itemFactory = createTransformer(note =>
  extendObservable(note, {
    get displayText() {
      return this.text
    },
    get sortIdx() {
      return 0
    },
  }),
)

const actions = {
  addNew: mAction(state => {
    state.notes.unshift(itemFactory({id: nanoid(), text: '21'}))
  }),
  replace: mAction((items, state) => {
    state.notes.replace(items.map(itemFactory))
  }),
}

const initState = (state, initialData) => {
  const notes = _.pathOr([], ['notes'], initialData)
  extendObservable(state, {
    notes: oArray(),
  })
  actions.replace(notes, state)
}

export const nc = oObject({initState, actions})

const createActions = state => {
  function addNew() {
    state.notes.add(itemFactory({id: nanoid(), text: ' note'}))
  }
  return {
    addNew: addNew,
    _replace: mAction(function _replace(items) {
      state.notes.replace(items.map(itemFactory))
    }),
  }
}

export const NC = (state, initialData) => {
  const notes = _.pathOr([], ['notes'], initialData)
  extendObservable(state, {
    notes: oArray(),
  })
  const actions = createActions(state)

  actions._replace(notes)

  return actions
}
