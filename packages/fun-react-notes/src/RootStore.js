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
  idProp,
  nullString,
  onSnapshot,
  resolveIdentifier,
  types,
} from './little-mst'
import {StorageItem} from './services/storage'
import {setFocusAndSelectionOnDOMId} from './components/utils'

const model = (n, p = null) => types.model(n, p)

const NoteModel = model('Note')
  .props({
    id: idProp('Note'),
    text: '',
    sortIdx: 0,
  })
  .views(self => {
    const root = () => getRoot(self)
    return {
      get isSelected() {
        return root().isNoteSelected(self)
      },
      get isFocused() {
        return root().isNoteFocused(self)
      },
    }
  })
  .actions(self => {
    const update = attrs => Object.assign(self, attrs)
    return {
      update,
      onTextChange: e => update({text: e.target.value}),
    }
  })

const NoteCollection = model('NotesCollection')
  .props({
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
    selectedKey: nullString,
    focusedKey: nullString,
  })
  .extend(self => ({
    views: {
      get _notes() {
        return self._notesCollection.all
      },
      get defaultFocusedIndex() {
        return self.allNotes.indexOf(self.selectedNote)
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
    get selectedNote() {
      const id = self.selectedKey
      return id
        ? resolveIdentifier(NoteModel, getRoot(self), id)
        : head(self.allNotes)
    },
    get selectedNoteId() {
      return self.selectedNote ? self.selectedNote.id : null
    },
    get focusedNoteId() {
      return self.focusedKey
    },
    isNoteSelected(m) {
      return self.selectedNoteId === m.id
    },
    isNoteFocused(m) {
      return self.focusedNoteId === m.id
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
      setSelectionState(selectionState) {
        Object.assign(self, selectionState)
      },
      onAddNote() {
        addNewNote(note => {
          const idx = 0
          updateSortIdx(idx, note, self.allNotes)
        })
      },
      onAddNoteAfterSelected() {
        addNewNote(note => {
          const oldIdx = indexOf(self.selectedNote)(self.allNotes)
          const idx = oldIdx < 0 ? 0 : oldIdx + 1
          updateSortIdx(idx, note, self.allNotes)
        })
      },
      onAddNoteBeforeSelected() {
        addNewNote(note => {
          const oldIdx = indexOf(self.selectedNote)(self.allNotes)
          const idx = oldIdx < 0 ? 0 : oldIdx
          updateSortIdx(idx, note, self.allNotes)
        })
      },
    }
  })

export default RootStore
