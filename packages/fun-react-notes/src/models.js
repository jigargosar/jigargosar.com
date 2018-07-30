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

function insertElAtIdx({idx, el, list}) {
  return {idx, el, list: insert(idx)(el)(list)}
}

function insertAfterIdx(el, list) {
  const idx = indexOf(el)(list)
  return (idx < 0 ? 0 : idx) + 1
}

function insertBeforeIdx(el, list) {
  const idx = indexOf(el)(list)
  return idx < 0 ? 0 : idx
}

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
        const idx = 0
        const {el, list} = insertElAtIdx({
          idx,
          el: createNote(),
          list: self.notesList,
        })

        updateSortIdx(list)
        self.notes.put(el)
        focusModel(el)
      },
      onAddNoteAfterSelected() {
        const idx = insertAfterIdx(self._sel, self.notesList)
        const {el, list} = insertElAtIdx({
          idx,
          el: createNote(),
          list: self.notesList,
        })

        updateSortIdx(list)
        self.notes.put(el)
        focusModel(el)
      },
      onAddNoteBeforeSelected() {
        const idx = insertBeforeIdx(self._sel, self.notesList)
        const {el, list} = insertElAtIdx({
          idx,
          el: createNote(),
          list: self.notesList,
        })

        updateSortIdx(list)
        self.notes.put(el)
        focusModel(el)
      },
      updateSelectedOnFocus(sel) {
        return (self._sel = sel)
      },
    }

    function focusModel(m) {
      return setFocusAndSelectionOnDOMId(m.id)
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
