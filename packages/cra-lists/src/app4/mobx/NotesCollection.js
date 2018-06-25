import {
  extendObservable,
  mActionBound,
  mAutoRun,
  mIntercept,
  mJS,
  mReaction,
  mSet,
  mValues,
  oObject,
} from './utils'
import {nanoid} from '../model/util'
import Chance from 'chance'
import {R} from '../services/utils'

const deletedProp = R.propOr(false, 'deleted')
const rejectDeleted = R.reject(deletedProp)
const filterDeleted = R.filter(deletedProp)

export const Note = (function Note() {
  function create({id, parentId, text, deleted, sortIdx}) {
    const note = oObject({
      id,
      parentId,
      text,
      deleted,
      sortIdx,
      toggleDeleted() {
        this.deleted = !this.deleted
      },
    })
    mReaction(
      () => [note.deleted],
      dep => {
        console.debug(`[note.deleted]`, ...dep)
        if (note.deleted) {
          note.sortIdx = 0
        }
      },
      {
        name: '[note.deleted]',
      },
    )
    mIntercept(note, 'id', ({newValue, object}) => {
      console.error(
        `Cannot modify id after creation id:`,
        object.id,
        'newValue',
        newValue,
        object,
      )
      throw new Error(`attempting to modify id after creation`)
    })
    return note
  }

  return {create}
})()

export const chance = new Chance()

export const NotesCollection = (function NotesCollection() {
  function create(snapshot = {}) {
    return oObject(
      {
        idMap: oObject(R.compose(R.map(Note.create))(snapshot)),
        get valuesArray() {
          return mValues(this.idMap)
        },
        get all() {
          return rejectDeleted(this.valuesArray)
        },
        get deleted() {
          return filterDeleted(this.valuesArray)
        },
        get snapshot() {
          return mJS(this.idMap)
        },
        newNote({parent = null} = {}) {
          const id = nanoid()
          return Note.create({
            id,
            parentId: R.isNil(parent) ? null : parent.id,
            text: '',
            deleted: false,
            sortIdx: 0,
          })
        },
        put(note) {
          mSet(this.idMap, note.id, note)
        },
        add(note) {
          this.put(note)
        },
      },
      {put: mActionBound},
      {name: 'notesCollection'},
    )
  }

  return {create}
})()

function createStore(props, viewsFn, actionsFn, name) {
  const base = oObject(props)
  // const views = viewsFn(base)
  const actions = actionsFn(base)

  return extendObservable(
    base,
    actions,
    {}, //R.map(R.always(mActionBound))(actions),
    {name},
  )
}

const foo = createStore(
  {p: 1},
  self => {
    return {
      get value() {
        return self.p
      },
    }
  },
  self => ({
    foo() {
      self.p = self.p + 1
    },
  }),
  'foo',
)

console.clear()

mAutoRun(() => {
  console.log(`foo.p`, foo.p)
})
R.times(foo.foo, 2)

function extendActions(actionsCreator, observable) {
  return extendObservable(observable, actionsCreator(observable))
}

const bar = extendActions(
  self => ({
    inc: () => self.p++,
  }),
  oObject({p: 1}),
)

console.log(`bar.inc()`, bar.inc())

mAutoRun(() => {
  console.log(`bar.p`, bar.p)
})
