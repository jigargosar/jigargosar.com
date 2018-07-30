import {
  _compose,
  _merge,
  _pipe,
  _prop,
  ascend,
  indexOf,
  insert,
  sortWith,
} from './little-ramda'
import {
  actions,
  applySnapshot,
  hotSnapshot,
  modelAttrs,
  modelNamed,
  modelProps,
  onSnapshot,
  types,
  updateAttrs,
  updateSortIdx,
  values,
  views,
} from './little-mst'
import {StorageItem} from './services/storage'
import {setFocusAndSelectionOnDOMId} from './components/utils'

const Note = _compose(
  actions(self => ({
    update: updateAttrs(self),
    onFocusSetSelected: () => root.updateSelectedOnFocus(self),
  })),
  modelAttrs({text: '', sortIdx: 0}),
  modelNamed,
)('Note')

const createNote = attrs => Note.create(_merge({text: 'Note Text'}, attrs))

const notesList = self =>
  _compose(sortWith([ascend(_prop('sortIdx'))]), values)(self.notes)

const nullRef = _compose(types.maybeNull, types.reference)

const Root = _pipe(
  modelProps({
    notes: types.map(Note),
    _sel: nullRef(Note),
  }),
  views(self => ({
    get notesList() {
      return notesList(self)
    },
  })),
  actions(self => ({
    onAddNote() {
      const idx = 0
      const note = createNote()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self.notes.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    onAddNoteAfterSelected() {
      const oldIdx = indexOf(self._sel)(self.notesList)
      const idx = oldIdx < 0 ? 0 : oldIdx + 1
      const note = createNote()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self.notes.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    onAddNoteBeforeSelected() {
      const oldIdx = indexOf(self._sel)(self.notesList)
      const idx = oldIdx < 0 ? 0 : oldIdx
      const note = createNote()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self.notes.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    updateSelectedOnFocus(sel) {
      self._sel = sel
    },
  })),
)(modelNamed('Root'))

const root = Root.create()

export const resetRoot = () => applySnapshot(root, {})

const rootSnap = StorageItem({name: 'rootSnapshot'})
applySnapshot(root, rootSnap.load())
onSnapshot(root, rootSnap.save)

export default hotSnapshot(module)(root)

if (module.hot) {
  window.r = root
}
