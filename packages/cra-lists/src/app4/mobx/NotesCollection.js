import {
  extendObservable,
  mAction,
  mIntercept,
  mJS,
  mSet,
  mValues,
  oObject,
} from './utils'
import {nanoid} from '../model/util'
import Chance from 'chance'
import {_, R} from '../utils'

const deletedProp = R.propOr(false, 'deleted')
const rejectDeleted = R.reject(deletedProp)
const filterDeleted = R.filter(deletedProp)

export const Note = (function Note() {
  function create({id, text, deleted, sortIdx}) {
    const note = oObject(
      {
        id,
        text,
        deleted,
        sortIdx,
        toggleDeleted() {
          this.deleted = !this.deleted
        },
      },
      {},
      {name: `Note@${id}`},
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

function extendObservableWithAction(obs, actions) {
  return extendObservable(
    obs,
    actions,
    _.map(_.always(mAction), actions),
  )
}

function createObservableObject({
  props = {},
  actions = {},
  name = 'ObservableObject',
} = {}) {
  const oObj = oObject(props, {}, {name})
  return extendObservableWithAction(oObj, actions)
}

export const NotesCollection = (function NotesCollection() {
  function create(snapshot = {}) {
    return createObservableObject({
      props: {
        idMap: R.compose(R.map(Note.create))(snapshot),
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
      },
      actions: {
        newNote() {
          return Note.create({
            id: nanoid(),
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
      name: 'NotesCollection',
    })
  }

  return {create}
})()
