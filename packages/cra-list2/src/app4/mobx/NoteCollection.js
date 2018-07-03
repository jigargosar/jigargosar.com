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
    actorUpdates = {},
  }) {
    validate('SSBNNO', [
      id,
      text,
      deleted,
      sortIdx,
      createdAt,
      actorUpdates,
    ])
    const note = createObservableObject({
      props: {
        id,
        text,
        deleted,
        sortIdx,
        createdAt,
        actorUpdates,
        get localActorUpdates() {
          return this.actorUpdates[localActorId]
        },
        isModifiedSince(ts) {},
      },
      actions: {
        toggleDeleted() {
          this._localActorUpdate({deleted: !this.deleted})
        },
        updateText(text) {
          this._localActorUpdate({text})
        },
        updateSortIdx(sortIdx) {
          this._localActorUpdate({sortIdx})
        },
        _localActorUpdate(props) {
          const keys = _.keys(props)
          if (_.eqBy(_.pick(keys), this, props)) {
            return
          }
          Object.assign(this, props)
          const modifiedAt = Date.now()
          this.actorUpdates[localActorId] = _.merge(
            this.actorUpdates[localActorId],
            _.zipObj(keys, _.repeat(modifiedAt, keys.length)),
          )
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
          const sortByModifiedAt = _.sortWith([
            _.ascend(_.prop('modifiedAt')),
          ])

          const modifiedSinceTimestampPred = n =>
            n.modifiedAt > timestamp &&
            _.equals(n.actorId, localActorId)

          return _.compose(
            sortByModifiedAt,
            _.filter(modifiedSinceTimestampPred),
          )(this.valuesArray)
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
          })
        },
        put(note) {
          mSet(this.idLookup, note.id, note)
        },
        add(note) {
          this.put(note)
        },
        upsertListFromExternalStore(notes) {
          notes.forEach(this.upsertFromExternalStore)
        },
        upsertFromExternalStore(props) {
          this.put(Note.create(props))
        },
      },
      name: 'NoteCollection',
    })
  }

  return {create}
})()
