import {
  _compose,
  _cond,
  _prop,
  always,
  ascend,
  indexOf,
  insert,
  isEmpty,
  sortWith,
  T,
} from './ramda'
import {
  addDisposer,
  applySnapshot,
  extend,
  idProp,
  model,
  onSnapshot,
  optional,
  types,
} from './little-mst'
import {StorageItem} from './services/storage'
import {clampArrIdx, forEachIndexed} from './little-ramda'
import {whenKey, withKeyEvent} from './components/utils'

const NoteModel = _compose(
  extend(self => {
    // const root = () => getRoot(self)
    const update = attrs => Object.assign(self, attrs)
    return {
      views: {},
      actions: {
        update,
        onTextChange: e => update({text: e.target.value}),
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
    push(...notes) {
      self.notes.push(...notes)
    },
    remove(note) {
      const idx = self.notes.indexOf(note)
      self.notes.splice(idx, 1)
    },
  }))

const RootStore = types
  .model('RootStore', {
    notesCollection: optional(NoteCollection),
    selectedNoteIdx: optional(
      types.refinement('Index', types.number, i => i >= 0),
      0,
    ),
  })
  .volatile(() => ({isEditorFocused: false}))
  .actions(self => ({
    setEditorFocused(bool) {
      self.isEditorFocused = bool
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
      return self.notesCollection.all
    },
    get selectedNote() {
      const allNotes = self.allNotes
      if (isEmpty(allNotes)) {
        return null
      }
      const idx = clampArrIdx(self.selectedNoteIdx, allNotes)
      return allNotes[idx]
    },
    get mode() {
      return _cond([
        [_prop('isEditorFocused'), always('editing')],
        [T, always('default')],
      ])(self)
    },
    get keyBindings() {
      const keyBindings = {
        default: [['a', 'onAddNote'], ['d', 'onDeleteSelectedNote']],
        editing: [],
      }
      return keyBindings[self.mode]
    },
    get onKeyDown() {
      return withKeyEvent(
        ...self.keyBindings.map(([key, cmdName]) =>
          whenKey(key)(self.on(cmdName)),
        ),
      )
    },
    get canDelete() {
      return self.allNotes.length > 1
    },
  }))
  .actions(self => ({
    setSelectedNoteIdx(idx) {
      if (idx < 0) {
        return
      }
      self.selectedNoteIdx = idx
    },
    on: cmdName => e => self[cmdName](e),
    deleteNote(note) {
      if (self.canDelete) {
        self.notesCollection.remove(note)
      }
    },
    onDeleteSelectedNote() {
      self.deleteNote(self.selectedNote)
    },
    setSelectedNote(note) {
      self.setSelectedNoteIdx(indexOf(note)(self.allNotes))
    },
    onAddNote() {
      const note = NoteModel.create()
      const allNotes = insert(0)(note)(self.allNotes)
      forEachIndexed((n, sortIdx) => n.update({sortIdx}))(allNotes)
      self.notesCollection.push(note)
      self.setSelectedNote(note)
    },
  }))

export default RootStore
