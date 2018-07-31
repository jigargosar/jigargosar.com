import {
  _prop,
  ascend,
  forEachIndexed,
  indexOf,
  insert,
  sortWith,
} from './little-ramda'
import {
  addDisposer,
  applySnapshot,
  hotSnapshot,
  idProp,
  nullRef,
  onSnapshot,
  types,
} from './little-mst'
import {StorageItem} from './services/storage'
import {setFocusAndSelectionOnDOMId} from './components/utils'

const NoteModel = types
  .model('Note', {
    id: idProp('Note'),
    text: '',
    sortIdx: 0,
  })
  .actions(self => ({
    update(attrs) {
      return Object.assign(self, attrs)
    },
  }))

const NoteCollection = types
  .model('NotesCollection', {
    _notes: types.array(NoteModel),
  })
  .views(self => ({
    get all() {
      return sortWith([ascend(_prop('sortIdx'))])(self._notes)
    },
  }))
  .actions(self => ({
    addAll(notes) {
      self._notes.push(...notes)
    },
  }))

const RootStore = types
  .model('RootStore', {
    _notesCollection: types.optional(NoteCollection, {}),
    _sel: nullRef(NoteModel),
  })
  .extend(self => ({
    views: {
      get _notes() {
        return self._notesCollection.all
      },
    },
  }))
  .actions(self => {
    const ls = StorageItem({name: 'rootSnapshot'})
    return {
      loadFromLS() {
        applySnapshot(self, ls.load())
      },
      reset() {
        applySnapshot(self, {})
      },
      saveToLSOnSnapshotChange() {
        addDisposer(self, onSnapshot(self, ls.save))
      },
    }
  })
  .views(self => ({
    get allNotes() {
      return self._notes
    },
  }))
  .actions(self => ({
    updateSelectedOnFocus(sel) {
      self._sel = sel
    },
    addNewNote(fn) {
      const note = NoteModel.create()
      fn(note)
      self._notesCollection.addAll([note])
      setFocusAndSelectionOnDOMId(note.id)
    },
    onAddNote() {
      self.addNewNote(note => {
        const idx = 0
        forEachIndexed((m, sortIdx) => m.update({sortIdx}))(
          insert(idx)(note)(self.allNotes),
        )
      })
    },
    onAddNoteAfterSelected() {
      self.addNewNote(note => {
        const oldIdx = indexOf(self._sel)(self.allNotes)
        const idx = oldIdx < 0 ? 0 : oldIdx + 1
        forEachIndexed((m, sortIdx) => m.update({sortIdx}))(
          insert(idx)(note)(self.allNotes),
        )
      })
    },
    onAddNoteBeforeSelected() {
      self.addNewNote(note => {
        const oldIdx = indexOf(self._sel)(self.allNotes)
        const idx = oldIdx < 0 ? 0 : oldIdx
        forEachIndexed((m, sortIdx) => m.update({sortIdx}))(
          insert(idx)(note)(self.allNotes),
        )
      })
    },
  }))

const store = RootStore.create()

store.loadFromLS()
store.saveToLSOnSnapshotChange()

export default hotSnapshot(module)(store)

if (module.hot) {
  window.s = store
}
