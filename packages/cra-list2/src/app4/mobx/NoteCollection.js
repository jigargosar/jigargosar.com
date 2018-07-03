import {
  createObservableObject,
  mIntercept,
  mJS,
  mSet,
  mValues,
} from './utils'
import {nanoid} from '../model/util'
import Chance from 'chance'
import {_, R, validate} from '../utils'
import {localActorId} from '../services/ActorId'

const deletedProp = R.propOr(false, 'deleted')
const rejectDeleted = R.reject(deletedProp)
const filterDeleted = R.filter(deletedProp)

export const Note = (function Note() {
  function create({
    id,
    text,
    deleted,
    sortIdx,
    createdAt = Date.now(),
    modifiedAt = Date.now(),
    actorId = localActorId,
  }) {
    validate('SSBNNNS', [
      id,
      text,
      deleted,
      sortIdx,
      createdAt,
      modifiedAt,
      actorId,
    ])
    const note = createObservableObject({
      props: {
        id,
        text,
        deleted,
        sortIdx,
        createdAt,
        modifiedAt,
        actorId,
      },
      actions: {
        toggleDeleted() {
          this.localActorUpdate({deleted: !this.deleted})
        },
        updateText(text) {
          this.localActorUpdate({text})
        },
        updateSortIdx(sortIdx) {
          this.localActorUpdate({sortIdx})
        },
        localActorUpdate(props) {
          Object.assign(this, props)
          this.modifiedAt = Date.now()
          this.actorId = localActorId
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
        idLookup: R.map(Note.create)(snapshot),
        get valuesArray() {
          return mValues(this.idLookup)
        },
        get active() {
          return rejectDeleted(this.valuesArray)
        },
        get deleted() {
          return filterDeleted(this.valuesArray)
        },
        get snapshot() {
          return mJS(this.idLookup)
        },
        getLocallyModifiedSince(timestamp) {
          return _.sortWith([_.ascend(_.prop('modifiedAt'))])(
            this.valuesArray.filter(
              n =>
                n.modifiedAt > timestamp &&
                _.equals(n.actorId, localActorId),
            ),
          )
        },
      },
      actions: {
        newNote({sortIdx = 0} = {}) {
          return Note.create({
            id: nanoid(),
            text: '',
            deleted: false,
            sortIdx,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            actorId: localActorId,
          })
        },
        put(note) {
          mSet(this.idLookup, note.id, note)
        },
        add(note) {
          this.put(note)
        },
        upsertFromFirestoreDocChanges() {},
        upsertFromExternalStore(props) {
          this.put(Note.create(props))
        },
      },
      name: 'NoteCollection',
    })
  }

  return {create}
})()
