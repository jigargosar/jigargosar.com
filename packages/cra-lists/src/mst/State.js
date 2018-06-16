import {PouchCollectionStore} from '../mobx-stores/PouchCollectionStore'
import ow from 'ow'
import {FirebaseService} from '../mobx-stores/FirebaseService'
import {SF} from '../safe-fun'

require('firebase/auth')
require('firebase/firestore')

const m = require('mobx')
const R = require('ramda')

function arrayToString(extraKeys) {
  return `[${R.join(`","`, extraKeys)}]`
}

const EditState = function() {
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
      type: 'idle',
      doc: null,
      form: {},
      error: null,
      fieldNames: [],
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
        ow(this.type, ow.string.equals('idle'))
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
  const state = m.observable(
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
      saveEdit() {
        this.editState.save((doc, form) =>
          this.g.userUpsert(R.merge(doc, form)),
        )
      },
      cancelEdit() {
        this.editState.cancelEdit()
      },
      onUpdate(doc) {
        return () => this.update(doc, {text: `${Math.random()}`})
      },
      onFormFieldChange(fieldName, event) {
        ow(fieldName, ow.string.equals('text'))
        return this.editState.updateForm({
          [fieldName]: event.target.value,
        })
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
      update: m.action.bound,
      saveEdit: m.action.bound,
      cancelEdit: m.action.bound,
      onFormFieldChange: m.action.bound,
    },
    {name: 'State'},
  )
  state.onFormFieldChange = R.curryN(2, state.onFormFieldChange)
  return state
})()
