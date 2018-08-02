import {
  _prop,
  ascend,
  forEachIndexed,
  head,
  indexOf,
  insert,
  sortWith,
} from './little-ramda'
import {
  addDisposer,
  applySnapshot,
  getRoot,
  hotSnapshot,
  idProp,
  nullString,
  onSnapshot,
  resolveIdentifier,
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
  .views(self => ({
    get isSelected() {
      return store.isNoteSelected(self)
    },
  }))
  .actions(self => ({
    update(attrs) {
      return Object.assign(self, attrs)
    },
    onTextChange(e) {
      self.update({text: e.target.value})
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
    _selId: nullString,
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
    get currentNote() {
      return self._selId
        ? resolveIdentifier(NoteModel, getRoot(self), self._selId)
        : head(self.allNotes)
    },
    isNoteSelected(m) {
      return self.currentNote === m
    },
  }))
  .actions(self => {
    function updateSortIdx(idx, note, allNotes) {
      forEachIndexed((n, sortIdx) => n.update({sortIdx}))(
        insert(idx)(note)(allNotes),
      )
    }

    function addNewNote(fn) {
      const note = NoteModel.create()
      fn(note)
      self._notesCollection.addAll([note])
      setFocusAndSelectionOnDOMId(note.id)
    }

    return {
      updateSelectedOnFocus(sel) {
        self._selId = sel.id
      },
      onAddNote() {
        addNewNote(note => {
          const idx = 0
          updateSortIdx(idx, note, self.allNotes)
        })
      },
      onAddNoteAfterSelected() {
        addNewNote(note => {
          const oldIdx = indexOf(self.currentNote)(self.allNotes)
          const idx = oldIdx < 0 ? 0 : oldIdx + 1
          updateSortIdx(idx, note, self.allNotes)
        })
      },
      onAddNoteBeforeSelected() {
        addNewNote(note => {
          const oldIdx = indexOf(self.currentNote)(self.allNotes)
          const idx = oldIdx < 0 ? 0 : oldIdx
          updateSortIdx(idx, note, self.allNotes)
        })
      },
    }
  })

const store = RootStore.create()

store.loadFromLS()
store.saveToLSOnSnapshotChange()

export default hotSnapshot(module)(store)

if (module.hot) {
  window.s = store
}
