import {
  createTransformer,
  extendObservable,
  mAction,
  oArray,
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

const notesCollectionActions = state => {
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
  const actions = notesCollectionActions(state)

  actions._replace(notes)

  return actions
}
