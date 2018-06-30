import {
  createObservableObject,
  mIntercept,
  mJS,
  mSet,
  mValues,
} from './utils'
import {nanoid} from '../model/util'
import Chance from 'chance'
import {R} from '../utils'

const deletedProp = R.propOr(false, 'deleted')
const rejectDeleted = R.reject(deletedProp)
const filterDeleted = R.filter(deletedProp)

export const Note = (function Note() {
  function create({id, text, deleted, sortIdx, parentId}) {
    const note = createObservableObject({
      props: {
        id,
        text,
        deleted,
        sortIdx,
        parentId,
      },
      actions: {
        toggleDeleted() {
          this.deleted = !this.deleted
        },
        updateText(text) {
          this.text = text
        },
        updateSortIdx(sortIdx) {
          this.sortIdx = sortIdx
        },
        updateParentId(parentId) {
          this.parentId = parentId
        },
      },
      name: `Note@${id}`,
    })

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

export const NoteCollection = (function NotesCollection() {
  function create(snapshot = {}) {
    return createObservableObject({
      props: {
        idMap: R.compose(R.map(Note.create))(snapshot),
        get valuesArray() {
          return mValues(this.idMap)
        },
        get active() {
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
        newNote({sortIdx = 0} = {}) {
          return Note.create({
            id: nanoid(),
            text: '',
            deleted: false,
            sortIdx,
            parentId: null,
          })
        },
        put(note) {
          mSet(this.idMap, note.id, note)
        },
        add(note) {
          this.put(note)
        },
      },
      name: 'NoteCollection',
    })
  }

  return {create}
})()
