import {PouchCollectionStore} from './PouchCollectionStore'
import ow from 'ow'
import {FirebaseService} from './FirebaseService'
import {SF} from '../safe-fun'

require('firebase/auth')
require('firebase/firestore')

const m = require('mobx')
const R = require('ramda')

function arrayToString(extraKeys) {
  return `[${R.join(`","`, extraKeys)}]`
}

const EditModalState = function() {
  function validateChanges(change, fieldNames) {
    const changePred = ow.object.label('change')
    ow(change, changePred.nonEmpty)
    ow(
      change,
      changePred.is(change => {
        const extraFields = R.compose(
          R.difference(R.__, fieldNames),
          R.keys,
        )(change)
        if (R.isEmpty(extraFields)) {
          return true
        }
        return `Expected to find only ${arrayToString(
          fieldNames,
        )} fields. Instead found ${arrayToString(
          extraFields,
        )} extra fields`
      }),
    )
  }

  return m.observable(
    {
      type: 'closed',
      doc: null,
      form: {},
      error: null,
      fieldNames: [],
      get isClosed() {
        return (this.type = 'closed')
      },
      _reset() {
        Object.assign(this, {
          type: 'closed',
          doc: null,
          form: {},
        })
      },
      cancelEdit() {
        ow(this.type, ow.string.oneOf(['editing', 'error']))
        this._reset()
      },
      startEditing(doc, fieldNames) {
        ow(this.type, ow.string.equals('closed'))
        const change = SF.pick(fieldNames, doc)
        validateChanges(change, fieldNames)
        Object.assign(this, {
          type: 'editing',
          doc: R.clone(doc),
          form: {},
          fieldNames,
        })

        this.updateForm(change)
      },

      save: m.flow(function*(cb) {
        ow(this.type, ow.string.equals('editing'))
        this.type = 'saving'
        try {
          yield cb(this.doc, this.form)
          this._reset()
        } catch (error) {
          Object.assign(this, {type: 'error', error})
          console.error('Update failed', this.error)
        }
      }),

      updateForm(change) {
        ow(this.type, ow.string.equals('editing'))

        validateChanges(change, this.fieldNames)
        R.mapObjIndexed((v, k) => {
          m.set(this.form, k, v)
        }, change)
      },
    },
    {
      form: m.observable,
      _reset: m.action.bound,
      startEditing: m.action.bound,
      updateForm: m.action.bound,
      cancelEdit: m.action.bound,
      save: m.action.bound,
    },
    {name: 'EditModalState'},
  )
}

/*
function noCAMDown(event) {
  const camState = SF.pick(['ctrlKey', 'altKey', 'metaKey'], event)
  return !R.any(R.identity, R.values(camState))
}
      afterCreate() {
        window.addEventListener('keypress', event => {
          if (event.key === `~` && noCAMDown(event)) {
            self.toggleRenderStateView()
          }
        })
      },
      toggleRenderStateView() {
        self.hideRenderState = !self.hideRenderState
      },
      onCloseRenderState() {
        self.hideRenderState = true
      },
*/
export const State = (() => {
  const state = m.observable(
    {
      pageTitle: 'CRA List Proto',
      get auth() {
        return FirebaseService.a
      },
      get fire() {
        return FirebaseService
      },
      get grains() {
        m.trace()
        return PouchCollectionStore('grain')
      },
      editModal: EditModalState(),
      onAddNew() {
        return this.grains.userUpsert({text: `${Math.random()}`})
      },
      _update(doc, change, fieldNames) {
        this.editModal.startEditing(doc, fieldNames)
        this.editModal.updateForm(change)

        this.editModal.save((doc, form) =>
          this.grains.userUpsert(R.merge(doc, form)),
        )
      },
      saveEdit() {
        this.editModal.save((doc, form) =>
          this.grains.userUpsert(R.merge(doc, form)),
        )
      },
      cancelEdit() {
        this.editModal.cancelEdit()
      },
      onUpdate(doc) {
        return () =>
          this._update(doc, {text: `${Math.random()}`}, ['text'])
      },
      onFormFieldChange(fieldName, event) {
        ow(fieldName, ow.string.equals('text'))
        return this.editModal.updateForm({
          [fieldName]: event.target.value,
        })
      },
      onStartEditing(doc) {
        return () => this.editModal.startEditing(doc, ['text'])
      },
      onToggleArchive(doc) {
        return () =>
          this._update(
            doc,
            {
              isArchived: !R.propOr(false, 'isArchived', doc),
            },
            ['isArchived'],
          )
      },
    },
    {
      onAddNew: m.action.bound,
      _update: m.action.bound,
      saveEdit: m.action.bound,
      cancelEdit: m.action.bound,
      onFormFieldChange: m.action.bound,
    },
    {name: 'State'},
  )
  state.onFormFieldChange = R.curryN(2, state.onFormFieldChange)
  return state
})()
