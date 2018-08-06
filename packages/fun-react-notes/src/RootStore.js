import {
  _compose,
  _prop,
  ascend,
  dec,
  inc,
  indexOf,
  insert,
  isEmpty,
  mathMod,
  sortWith,
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
    unshift(...notes) {
      self.notes.unshift(...notes)
    },
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
    isEditing: false,
  })
  .actions(self => ({
    setIsEditing(bool) {
      self.isEditing = bool
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
      return self.isEditing ? 'editing' : 'default'
    },
    get keyBindings() {
      const keyBindings = {
        default: [
          //
          ['a', 'onAddNote'],
          ['d', 'onDeleteSelectedNote'],
          ['up', 'onSelectPrev'],
          ['down', 'onSelectNext'],
        ],
        editing: [
          ['alt+a', 'onAddNote'],
          ['alt+d', 'onDeleteSelectedNote'],
          ['alt+up', 'onSelectPrev'],
          ['alt+down', 'onSelectNext'],
        ],
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
      self.selectedNoteIdx = mathMod(idx)(self.allNotes.length)
    },
    overSelectedNoteIdx(fn) {
      self.setSelectedNoteIdx(fn(self.selectedNoteIdx))
    },
    deleteNote(note) {
      if (self.canDelete) {
        self.notesCollection.remove(note)
      }
    },
    setSelectedNote(note) {
      self.setSelectedNoteIdx(indexOf(note)(self.allNotes))
    },
    on: cmdName => e => self[cmdName](e),
    onSelectPrev() {
      self.overSelectedNoteIdx(dec)
    },
    onSelectNext() {
      self.overSelectedNoteIdx(inc)
    },
    onDeleteSelectedNote() {
      self.deleteNote(self.selectedNote)
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
