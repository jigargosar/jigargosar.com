import {
  extendObservable,
  mAction,
  mActionBound,
  mAutoRun,
  mComputed,
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

console.clear()

const extendActions = R.curry((createActions, observable) => {
  const actions = createActions(observable)
  return extendObservable(observable, actions, R.map(mAction))
})

const extendComputed = R.curry((createComputed, observable) => {
  const computed = createComputed(observable)
  return extendObservable(observable, computed, R.map(mComputed))
})

const bar = R.compose(
  extendComputed(self => ({
    pc: () => self.p,
    get pcp() {
      return self.p
    },
  })),
  extendActions(self => ({
    inc: () => self.p++,
  })),
  oObject,
)({p: 1})

mAutoRun(() => {
  console.log(`bar.p`, bar.p)
  console.log(`bar.pc`, bar.pc())
  console.log(`bar.pcp`, bar.pcp)
})

bar.inc()
