import {_compose, dec, inc, indexOf, isEmpty, mathMod} from './lib/ramda'
import {
  addDisposer,
  applySnapshot,
  extend,
  idProp,
  model,
  onSnapshot,
  optional,
  types,
  UndoManager,
} from './lib/little-mst'
import {StorageItem} from './lib/storage'
import {clampArrIdx, mapFirst} from './lib/little-ramda'
import {whenKey, withKeyEvent} from './lib/little-react'

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
  }),
)

const NoteCollection = model('NotesCollection')
  .props({
    notes: types.array(NoteModel),
  })
  .views(self => ({
    get all() {
      return self.notes
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

const State = model('State', {
  notesCollection: optional(NoteCollection),
  selectedNoteIdx: optional(
    types.refinement('Index', types.number, i => i >= 0),
    0,
  ),
  isEditing: false,
})

const RootStore = types
  .model('RootStore', {
    state: optional(State),
    history: optional(UndoManager, {}),
  })
  .views(self => ({
    get canUndo() {
      return self.history.canUndo
    },
    get canRedo() {
      return self.history.canRedo
    },
    get withoutUndo() {
      return self.history.withoutUndo
    },
    undo() {
      self.canUndo && self.history.undo()
    },
    redo() {
      self.canRedo && self.history.redo()
    },
  }))
  .views(self => ({
    get notesCollection() {
      return self.state.notesCollection
    },
    get selectedNoteIdx() {
      return self.state.selectedNoteIdx
    },
    set selectedNoteIdx(val) {
      return (self.state.selectedNoteIdx = val)
    },
    get isEditing() {
      return self.state.isEditing
    },
    set isEditing(val) {
      return (self.state.isEditing = val)
    },
  }))
  .actions(self => {
    const ls = StorageItem({name: 'rootSnapshot'})
    return {
      initStore() {
        if (self.allNotes.length === 0) {
          self.withoutUndo(() => {
            self.notesCollection.unshift(NoteModel.create())
          })
        }
      },
      afterCreate() {
        self.initStore()
      },
      loadFromLS() {
        self.withoutUndo(() => applySnapshot(self, ls.load()))
        self.initStore()
      },
      reset() {
        self.withoutUndo(() => applySnapshot(self, {}))
        self.initStore()
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
      const fallback = [['mod+z', 'onUndo'], ['mod+shift+z', 'onRedo']]
      const defaultEditingAlt = [
        ['a', 'onAddNote'],
        ['d', 'onDeleteSelectedNote'],
        ['up', 'onSelectPrev'],
        ['down', 'onSelectNext'],
      ]

      const keyBindings = {
        default: [
          //
          ...defaultEditingAlt,
          ...fallback,
        ],
        editing: [
          //
          ...mapFirst(k => `alt+${k}`)(defaultEditingAlt),
          ...fallback,
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
    setIsEditing(bool) {
      self.isEditing = bool
    },
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
    onUndo(e) {
      e.preventDefault()
      self.canUndo && self.history.undo()
    },
    onRedo(e) {
      e.preventDefault()
      self.canRedo && self.history.redo()
    },
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
      self.notesCollection.unshift(note)
      self.setSelectedNote(note)
    },
  }))

export default RootStore
