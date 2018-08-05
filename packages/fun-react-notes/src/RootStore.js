import {_compose, _prop, ascend, indexOf, insert, sortWith} from './ramda'
import {
  addDisposer,
  applySnapshot,
  computed,
  extend,
  getRoot,
  idProp,
  model,
  onSnapshot,
  optional,
  types,
} from './little-mst'
import {StorageItem} from './services/storage'
import {SingleSelectionStore} from './SingleSelectionStore'
import {forEachIndexed} from './little-ramda'
import {whenKey, withKeyEvent} from './components/utils'
import store from './store'

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
    addNewAt(idx) {},
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
    notesCollection: optional(NoteCollection),
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
  .views(self => ({
    get notesSelection() {
      return self._sel
    },
    get allNotes() {
      return self.notesCollection.all
    },
    get selectedNote() {
      return self.allNotes[self._sel.selectedIdx]
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
    get onKeyDown() {
      const keyBindings = [
        ['mod+enter', 'onAddNoteAfterSelected'],
        ['shift+mod+enter', 'onAddNoteBeforeSelected'],
      ]
      return withKeyEvent(
        keyBindings.map(([key, cmdName]) =>
          whenKey(key)(self.on(cmdName)),
        ),
      )
    },
  }))
  .actions(self => {
    const updateSortIdx = forEachIndexed((n, sortIdx) =>
      n.update({sortIdx}),
    )
    function updateSortIdxWithNoteAt(idx, note, allNotes) {
      updateSortIdx(insert(idx)(note)(allNotes))
    }

    function addNewNoteAt(idx) {
      const note = NoteModel.create()
      updateSortIdxWithNoteAt(idx, note, self.allNotes)
      self.notesCollection.addAll([note])
      self._sel.setSelectedKey(note.id)
    }

    return {
      on: cmdName => e => self[cmdName](e),
      afterCreate() {
        self._sel.setComputedKeys(
          computed(() => self.allNotes.map(_prop('id')), {name: 'allni'}),
        )
      },
      deleteNote(note) {
        self.notesCollection.deleteNote(note)
      },
      onAddNote() {
        addNewNoteAt(0)
      },
      onAddNoteAfterSelected() {
        const oldIdx = indexOf(self.selectedNote)(self.allNotes)
        const idx = oldIdx < 0 ? 0 : oldIdx + 1
        addNewNoteAt(idx)
      },
      onAddNoteBeforeSelected() {
        const oldIdx = indexOf(self.selectedNote)(self.allNotes)
        const idx = oldIdx < 0 ? 0 : oldIdx
        addNewNoteAt(idx)
      },
    }
  })

export default RootStore
