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
import {createFieldPath} from './Fire'

const deletedProp = R.propOr(false, 'deleted')
const rejectDeleted = R.reject(deletedProp)
const filterDeleted = R.filter(deletedProp)

const getLocalActorUpdates = _.path(['actorUpdates', localActorId])

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
          return getLocalActorUpdates(this)
          // return this.actorUpdates[localActorId]
        },
        set localActorUpdates(updates) {
          this.actorUpdates[localActorId] = updates
        },

        get lastLocallyModifiedAt() {
          return _.compose(_.reduce(_.max, this.createdAt), _.values)(
            this.localActorUpdates,
          )
        },
        getLocalModificationsSince(timestamp) {
          const modifications = _.compose(
            _.concat([
              createFieldPath(`actorUpdates.${localActorId}`),
              this.localActorUpdates,
            ]),
            _.flatten,
            _.toPairs,
            _.pick(_.__, this),
            _.keys,
            _.filter(modifiedAt => modifiedAt > timestamp),
          )(this.localActorUpdates)
          console.debug(`modifications`, modifications)
          return modifications
        },
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
          this.localActorUpdates = _.merge(
            this.localActorUpdates,
            _.zipObj(keys, _.repeat(Date.now(), keys.length)),
          )
        },
        updateFromRemoteStore(props) {
          const localActorUpdates = getLocalActorUpdates(props)
          if (
            _.isNil(localActorUpdates) ||
            _.eqProps('actorUpdates', this, props)
          ) {
            console.log(
              'ignoring updateFromRemoteStore',
              this.actorUpdates,
              props.actorUpdates,
            )
            return
          }

          const mergeAllWithMax = _.reduce(_.mergeWith(_.max), {})
          const latestRemoteActorUpdates = _.compose(
            mergeAllWithMax,
            _.values,
            _.omit([localActorId]),
            _.prop('actorUpdates'),
          )(props)

          const filteredRemoteActorUpdateKeys = _.compose(
            _.map(_.head),
            _.filter(([key, modifiedAt]) => {
              const localActorModifiedAt = localActorUpdates[key]
              return (
                _.isNil(localActorModifiedAt) ||
                modifiedAt > localActorModifiedAt
              )
            }),
            _.toPairs,
          )(latestRemoteActorUpdates)

          const remoteProps = _.pick(
            filteredRemoteActorUpdateKeys,
            props,
          )
          console.log(
            `Note.updateFromRemoteStore: remoteProps`,
            remoteProps,
            props.actorUpdates,
          )
          Object.assign(this, remoteProps, {
            actorUpdates: props.actorUpdates,
          })
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
            _.ascend(_.prop('lastLocallyModifiedAt')),
          ])

          return _.compose(
            sortByModifiedAt,
            _.filter(n => n.lastLocallyModifiedAt > timestamp),
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
        upsertListFromRemoteStore(notes) {
          notes.forEach(this.upsertFromRemoteStore)
        },
        upsertFromRemoteStore(props) {
          const note = this.idLookup[props.id]
          if (_.isNil(note)) {
            this.put(Note.create(props))
          } else {
            note.updateFromRemoteStore(props)
          }
        },
      },
      name: 'NoteCollection',
    })
  }

  return {create}
})()
