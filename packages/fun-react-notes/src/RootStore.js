import {
  _merge,
  _prop,
  ascend,
  forEachIndexed,
  head,
  indexOf,
  insert,
  mathMod,
  sortWith,
} from './little-ramda'
import {
  addDisposer,
  applySnapshot,
  autorun,
  getRoot,
  idProp,
  nullString,
  onSnapshot,
  resolveIdentifier,
  types,
} from './little-mst'
import {StorageItem} from './services/storage'
import {
  setFocusAndSelectionOnDOMId,
  whenKeyPD,
  withKeyEvent,
} from './components/utils'

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

const optional = (t, dv = {}) => types.optional(t, dv)
const stringArray = types.array(types.string)

const SingleSelectionController = model('SingleSelectionController')
  //
  .props({
    selectedKey: nullString,
    focusedKey: nullString,
    keys: optional(stringArray, []),
  })
  .views(self => ({
    get selectedKeyIdx() {
      const idx = self.keys.indexOf(self.selectedKey)
      return idx === -1 ? NaN : idx
    },
    getContainerProps(props = {}) {
      return _merge(
        {
          onBlur: () => {},
          onFocus: () => {},
          onKeyDown: withKeyEvent(whenKeyPD('down')(self.selectNext)),
          onMouseDown: () => {},
          tabIndex: 0,
        },
        props,
      )
    },
    getItemProps(props = {}) {
      return _merge(
        {
          onClick: () => {
            self.setSelectedKey(props.key)
          },
        },
        props,
      )
    },
  }))
  .actions(self => ({
    setSelectedKey(key) {
      self.selectedKey = key
    },
    setKeys(keys) {
      self.keys = keys
    },
    selectNext() {
      const nextIdx = mathMod(self.selectedKeyIdx + 1, self.keys.length)
      self.selectedKey = nextIdx ? self.keys[nextIdx] : null
    },
    selectPrev() {
      const nextIdx = mathMod(self.selectedKeyIdx - 1, self.keys.length)
      self.selectedKey = nextIdx ? self.keys[nextIdx] : null
    },
  }))

const RootStore = types
  .model('RootStore', {
    _notesCollection: optional(NoteCollection),
    // selectedKey: nullString,
    focusedKey: nullString,
    ns: optional(SingleSelectionController),
  })
  .extend(self => ({
    views: {
      get _notes() {
        return self._notesCollection.all
      },
      set selectedKey(v) {},
      get selectedKey() {
        return self.ns.selectedKey
      },
    },
  }))
  .actions(self => ({
    afterCreate() {
      addDisposer(
        self,
        autorun(() => {
          self.ns.setKeys(self.allNotes.map(_prop('id')))
        }),
      )
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
