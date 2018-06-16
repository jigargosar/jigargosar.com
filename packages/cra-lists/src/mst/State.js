import {PouchCollectionStore} from '../mobx-stores/PouchCollectionStore'
import ow from 'ow'
import {FirebaseService} from '../mobx-stores/FirebaseService'
import {SF} from '../safe-fun'

require('firebase/auth')
require('firebase/firestore')

const m = require('mobx')
const R = require('ramda')

const EditState = function() {
  return m.observable(
    {
      type: 'idle',
      doc: null,
      form: {},
      error: null,
      _reset() {
        Object.assign(this, {
          type: 'idle',
          doc: null,
          form: {},
        })
      },
      cancelEdit() {
        ow(this.type, ow.string.oneOf(['editing', 'error']))
        this._reset()
      },
      startEditing(doc, fieldNames) {
        Object.assign(this, {
          type: 'editing',
          doc: R.clone(doc),
          form: {},
        })

        this.updateForm(SF.pick(fieldNames, doc))
      },

      setError(error) {
        Object.assign(this, {type: 'error', error})
      },

      setSaving() {
        ow(this.type, ow.string.equals('editing'))
        this.type = 'saving'
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

      updateFormField(fieldName, value) {
        ow(this.type, ow.string.equals('editing'))
        m.set(this.form, fieldName, value)
      },

      updateForm(change) {
        ow(this.type, ow.string.equals('editing'))
        ow(change, ow.object.label('change').nonEmpty)
        R.mapObjIndexed((v, k) => {
          m.set(this.form, k, v)
        }, change)
      },
    },
    {
      form: m.observable,
      _reset: m.action.bound,
      startEditing: m.action.bound,
      setError: m.action.bound,
      updateFormField: m.action.bound,
      updateForm: m.action.bound,
      cancelEdit: m.action.bound,
      save: m.action.bound,
    },
    {name: 'EditState'},
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
  return m.observable(
    {
      pageTitle: 'CRA List Proto',
      get auth() {
        return FirebaseService.a
      },
      get fire() {
        return FirebaseService
      },
      get g() {
        m.trace()
        return PouchCollectionStore('grain')
      },
      editState: EditState(),
      onAddNew() {
        return this.g.userUpsert({text: `${Math.random()}`})
      },
      update(doc, change) {
        this.editState.startEditing(doc, ['text'])
        this.editState.updateForm(change)

        this.editState.save((doc, form) =>
          this.g.userUpsert(R.merge(doc, form)),
        )
      },
      onUpdate(doc) {
        return () => this.update(doc, {text: `${Math.random()}`})
      },
      saveEdit() {
        this.editState.save((doc, form) =>
          this.g.userUpsert(R.merge(doc, form)),
        )
      },
      cancelEdit() {
        this.editState.cancelEdit()
      },
      updateForm(fieldName, value) {
        this.editState.updateFormField(fieldName, value)
      },
      onFormChange(fieldName) {
        ow(fieldName, ow.string.equals('text'))
        return event =>
          this.editState.updateFormField(
            fieldName,
            event.target.value,
          )
      },
      onStartEditing(doc) {
        return () => this.editState.startEditing(doc, ['text'])
      },
      onToggleArchive(doc) {
        return () =>
          this.update(doc, {
            isArchived: !R.propOr(false, 'isArchived', doc),
          })
      },
    },
    {
      onAddNew: m.action.bound,
      // startEdit: m.action.bound,
      // updateForm: m.action.bound,
      saveEdit: m.action.bound,
      // cancelEdit: m.action.bound,
    },
    {name: 'State'},
  )
})()
