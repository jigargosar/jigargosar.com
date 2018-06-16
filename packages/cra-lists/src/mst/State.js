import {PouchCollectionStore} from '../mobx-stores/PouchCollectionStore'
import ow from 'ow'
import {FirebaseService} from '../mobx-stores/FirebaseService'

require('firebase/auth')
require('firebase/firestore')

const m = require('mobx')
const R = require('ramda')

const EditState = function() {
  return m.observable(
    {
      type: 'idle',
      doc: null,
      form: {text: null},
      setIdle() {
        Object.assign(this, {
          type: 'idle',
          doc: null,
          form: null,
        })
      },

      startEditing(doc, changes) {
        Object.assign(this, {
          type: 'editing',
          doc: R.clone(doc),
          changes,
        })
      },

      setError(error) {
        Object.assign(this, {type: error})
      },

      updateForm(fieldName, value) {
        this.form.set(fieldName, value)
      },
    },
    {setIdle: m.action.bound},
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
      update: m.flow(function*(doc, change) {
        try {
          yield this.g.userUpsert(R.merge(doc, change))
          this.editState.setIdle()
        } catch (e) {
          this.editState.setError(e)
          console.warn('Update failed', this.editState, e)
        }
      }),
      onUpdate(doc) {
        return () => this.update(doc, {text: `${Math.random()}`})
      },
      startEdit(doc) {
        this.editState = {
          type: 'editing',
          doc: R.clone(doc),
          form: {text: doc.text},
        }
      },
      saveEdit: m.flow(function*() {
        ow(this.editState.type, ow.string.equals('editing'))
        this.editState.type = 'saving'
        try {
          yield this.g.userUpsert(
            R.merge(this.editState.doc, this.editState.form),
          )
          this.editState.setIdle()
        } catch (e) {
          this.editState.setError('error')
          console.warn('Update failed', this.editState, e)
        }
      }),
      cancelEdit() {
        ow(this.editState.type, ow.string.oneOf(['editing', 'error']))
        this.editState.setIdle()
      },
      updateForm(fieldName, value) {
        ow(this.editState.type, ow.string.equals('editing'))
        this.editState.updateForm(fieldName, value)
      },
      onFormChange(fieldName) {
        ow(fieldName, ow.string.equals('text'))
        return event => this.updateForm(fieldName, event.target.value)
      },
      onStartEditing(doc) {
        return () => this.startEdit(doc)
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
      // saveEdit: m.action.bound,
      // cancelEdit: m.action.bound,
    },
    {name: 'State'},
  )
})()
