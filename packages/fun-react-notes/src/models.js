import {
  _compose,
  _pipe,
  _prepend,
  _prop,
  _tap,
  ascend,
  forEachIndexed,
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
    onFocusSetSelected: () => root.onFocusSetSelected(self),
  })),
  modelAttrs({text: '', sortIdx: 0}),
  modelNamed,
)('Note')

const createNote = () => Note.create({text: 'Note Text'})

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
  actions(self => {
    const focusModelId = m => setFocusAndSelectionOnDOMId(m.id)

    const addNote = self => {
      const note = createNote()
      _compose(
        forEachIndexed((n, sortIdx) => n.update({sortIdx})),
        _prepend(note),
        notesList,
      )(self)
      return self.notes.put(note)
    }

    return {
      onAddNote: () => onAddNote(self),
      onFocusSetSelected: onFocusSetSelected(self),
    }

    function onFocusSetSelected(self) {
      return sel => (self._sel = sel)
    }

    function onAddNote(self) {
      return _compose(_tap(focusModelId), addNote)(self)
    }
  }),
)(modelNamed('Root'))

const root = Root.create()

export const resetRoot = () => applySnapshot(root, {})

const rootSnap = StorageItem({name: 'rootSnapshot'})
applySnapshot(root, rootSnap.load())
onSnapshot(root, rootSnap.save)

export default hotSnapshot(module)(root)
