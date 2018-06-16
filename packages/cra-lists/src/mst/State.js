import {flow, types, getSnapshot} from 'mobx-state-tree'
import {observable} from 'mobx'
import {SF} from '../safe-fun'
import {PouchCollectionStore} from '../mobx-stores/PouchCollectionStore'
import ow from 'ow'
import {FirebaseService} from '../mobx-stores/FirebaseService'

require('firebase/auth')
require('firebase/firestore')

const m = require('mobx')
const R = require('ramda')

const EditState = function() {
  return observable(
    {
      type: 'idle',
      doc: null,
      form: observable({text: null}),
    },
    {},
    {name: 'EditState'},
  )
}

function noCAMDown(event) {
  const camState = SF.pick(['ctrlKey', 'altKey', 'metaKey'], event)
  return !R.any(R.identity, R.values(camState))
}

export const State = types
  .model('RootState', {
    pageTitle: 'CRA List Proto',
    hideRenderState: true,
  })
  .volatile(() => {
    return {
      g: PouchCollectionStore('grain'),
      editState: EditState(),
      fire: FirebaseService,
    }
  })
  .views(self => {
    return {
      get grainsList() {
        return self.g.list
      },
      debugJSON() {
        return R.merge(getSnapshot(self), {g: m.toJS(self.g)})
        // return m.toJS(self.g)
      },
    }
  })
  .actions(self => {
    return {
      afterCreate() {
        window.addEventListener('keypress', event => {
          if (event.key === `~` && noCAMDown(event)) {
            self.toggleRenderStateView()
          }
        })
        self.g.load()
      },
      toggleRenderStateView() {
        self.hideRenderState = !self.hideRenderState
      },
      onCloseRenderState() {
        self.hideRenderState = true
      },
      onAddNew() {
        return self.g.userUpsert({text: `${Math.random()}`})
      },
      update: flow(function*(doc, change) {
        try {
          yield self.g.userUpsert(R.merge(doc, change))
          self.editState = observable({type: 'idle'})
        } catch (e) {
          self.editState = observable({
            type: 'error',
            doc: R.clone(doc),
            form: change,
          })
          console.warn('Update failed', self.editState, e)
        }
      }),
      onUpdate(doc) {
        return () => self.update(doc, {text: `${Math.random()}`})
      },
      startEdit(doc) {
        self.editState = observable({
          type: 'editing',
          doc: R.clone(doc),
          form: {text: doc.text},
        })
      },
      saveEdit: flow(function*() {
        ow(self.editState.type, ow.string.equals('editing'))
        self.editState.type = 'saving'
        try {
          yield self.g.userUpsert(
            R.merge(self.editState.doc, self.editState.form),
          )
          self.editState = observable({type: 'idle'})
        } catch (e) {
          self.editState.type = 'error'
          console.warn('Update failed', self.editState, e)
        }
      }),
      cancelEdit() {
        ow(self.editState.type, ow.string.oneOf(['editing', 'error']))
        self.editState.type = 'idle'
      },
      updateForm(fieldName, value) {
        ow(self.editState.type, ow.string.equals('editing'))
        self.editState.form[fieldName] = value
      },
      onFormChange(fieldName) {
        ow(fieldName, ow.string.equals('text'))
        return event => self.updateForm(fieldName, event.target.value)
      },
      onStartEditing(doc) {
        return () => self.startEdit(doc)
      },
      onToggleArchive(doc) {
        return () =>
          self.update(doc, {
            isArchived: !R.propOr(false, 'isArchived', doc),
          })
      },
    }
  })

const S = (() => {})()
