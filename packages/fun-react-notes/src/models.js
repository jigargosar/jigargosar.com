import {
  _compose,
  _merge,
  _pipe,
  _prop,
  _tap,
  ascend,
  forEachIndexed,
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
    get selIdx() {
      return indexOf(self._sel)(self.notesList)
    },
    get selIdxOrZero() {
      return self.selIdx < 0 ? 0 : self.selIdx
    },
  })),
  actions(self => {
    return {
      onAddNote() {
        return addNoteAndFocus(self, 0)
      },
      onAddNoteAfterSelected() {
        return addNoteAndFocus(self, self.selIdxOrZero + 1)
      },
      onAddNoteBeforeSelected() {
        return addNoteAndFocus(self, self.selIdxOrZero)
      },
      updateSelectedOnFocus(sel) {
        return (self._sel = sel)
      },
    }

    function addNoteAt(sortIdx) {
      return self => {
        const note = createNote({sortIdx})
        _compose(
          forEachIndexed((n, sortIdx) => n.update({sortIdx})),
          insert(sortIdx)(note),
          notesList,
        )(self)
        return self.notes.put(note)
      }
    }

    const tapFocusModelId = _tap(m => setFocusAndSelectionOnDOMId(m.id))

    function addNoteAndFocus(self, idx) {
      return _compose(tapFocusModelId, addNoteAt(idx))(self)
    }
  }),
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
