import {
  _compose,
  _pipe,
  _prop,
  _tap,
  ascend,
  forEachIndexed,
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
    return {
      onAddNote: onAddNoteAt(self),
      onAddNoteAfterSelected: onAddNoteAt(self),
      onAddNoteBeforeSelected: onAddNoteAt(self),
      updateSelectedOnFocus: updateSelectedOnFocus(self),
    }

    function addNoteAt(idx) {
      return self => {
        const note = createNote()
        _compose(
          forEachIndexed((n, sortIdx) => n.update({sortIdx})),
          insert(idx)(note),
          notesList,
        )(self)
        return self.notes.put(note)
      }
    }

    function updateSelectedOnFocus(self) {
      return sel => (self._sel = sel)
    }

    function tapFocusModelId() {
      return _tap(m => setFocusAndSelectionOnDOMId(m.id))
    }

    function onAddNoteAt(self, idx = 0) {
      return () => _compose(tapFocusModelId(), addNoteAt(idx))(self)
    }
  }),
)(modelNamed('Root'))

const root = Root.create()

export const resetRoot = () => applySnapshot(root, {})

const rootSnap = StorageItem({name: 'rootSnapshot'})
applySnapshot(root, rootSnap.load())
onSnapshot(root, rootSnap.save)

export default hotSnapshot(module)(root)
