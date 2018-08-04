import {
  _compose,
  _prop,
  ascend,
  head,
  indexOf,
  insert,
  sortWith,
} from './ramda'
import {
  addDisposer,
  applySnapshot,
  autorun,
  extend,
  getRoot,
  idProp,
  model,
  onSnapshot,
  optional,
  resolveIdentifier,
  types,
} from './little-mst'
import {StorageItem} from './services/storage'
import {setFocusAndSelectionOnDOMId} from './components/utils'
import {SingleSelectionStore} from './SingleSelectionStore'
import {forEachIndexed} from './little-ramda'

const NoteModel = _compose(
  extend(self => {
    const root = () => getRoot(self)
    const update = attrs => Object.assign(self, attrs)
    return {
      views: {
        get isSelected() {
          return root().isNoteSelected(self)
        },
        get isFocused() {
          return root().isNoteFocused(self)
        },
        get listItemProps() {
          return root().getNoteListItemProps(self)
        },
      },
      actions: {
        update,
        onTextChange: e => update({text: e.target.value}),
        onDelete: () => root().deleteNote(self),
      },
    }
  }),
)(
  model('Note', {
    id: idProp('Note'),
    text: '',
    sortIdx: 0,
  }),
)

const NoteCollection = model('NotesCollection')
  .props({
    notes: types.array(NoteModel),
  })
  .views(self => ({
    get all() {
      return sortWith([ascend(_prop('sortIdx'))])(self.notes)
    },
  }))
  .actions(self => ({
    addAll(notes) {
      self.notes.push(...notes)
    },
    deleteNote(note) {
      const idx = self.notes.indexOf(note)
      self.notes.splice(idx, 1)
    },
  }))

const RootStore = types
  .model('RootStore', {
    _notesCollection: optional(NoteCollection),
    _sel: optional(SingleSelectionStore),
  })
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
  .actions(self => ({
    afterCreate() {
      addDisposer(
        self,
        autorun(() => {
          self._sel.setKeys(self.allNotes.map(_prop('id')))
        }),
      )
    },
  }))
  .views(self => ({
    get allNotes() {
      return self._notesCollection.all
    },
    get selectedNote() {
      const id = self._sel.selectedKey
      return id
        ? resolveIdentifier(NoteModel, getRoot(self), id)
        : head(self.allNotes)
    },
    get noteListProps() {
      return self._sel.getContainerProps()
    },
    isNoteSelected(m) {
      return self.selectedNote === m
    },
    isNoteFocused(m) {
      return false
    },
    getNoteListItemProps(note) {
      return self._sel.getItemProps({key: note.id, note})
    },
  }))
  .actions(self => {
    const updateSortIdx = forEachIndexed((n, sortIdx) =>
      n.update({sortIdx}),
    )
    function updateSortIdxWithNoteAt(idx, note, allNotes) {
      updateSortIdx(insert(idx)(note)(allNotes))
    }

    function addNewNote(fn) {
      const note = NoteModel.create()
      fn(note)
      self._notesCollection.addAll([note])
      setFocusAndSelectionOnDOMId(note.id)
    }

    return {
      deleteNote(note) {
        self._notesCollection.deleteNote(note)
      },
      onAddNote() {
        addNewNote(note => {
          const idx = 0
          updateSortIdxWithNoteAt(idx, note, self.allNotes)
        })
      },
      onAddNoteAfterSelected() {
        addNewNote(note => {
          const oldIdx = indexOf(self.selectedNote)(self.allNotes)
          const idx = oldIdx < 0 ? 0 : oldIdx + 1
          updateSortIdxWithNoteAt(idx, note, self.allNotes)
        })
      },
      onAddNoteBeforeSelected() {
        addNewNote(note => {
          const oldIdx = indexOf(self.selectedNote)(self.allNotes)
          const idx = oldIdx < 0 ? 0 : oldIdx
          updateSortIdxWithNoteAt(idx, note, self.allNotes)
        })
      },
    }
  })

export default RootStore
