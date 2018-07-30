import {_compose} from './little-ramda'
import {
  actions,
  applySnapshot,
  getRoot,
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

const Note = _compose(
  actions(self => ({
    update: updateAttrs(self),
  })),
  modelAttrs({text: ''}),
  modelNamed,
)('Note')

const createNote = () => Note.create({text: 'Note Text'})

const addNote = self => () => self.notes.put(createNote())
const notesList = self => values(self.notes)

const onFocusSetSelected = self => getRoot(self).onFocusSetSelected(self)

const nullRef = _compose(types.maybeNull, types.reference)

const Root = _compose(
  views(self => ({
    get notesList() {
      return notesList(self)
    },
  })),
  actions(self => ({
    addNote: addNote(self),
    onFocusSetSelected: onFocusSetSelected(self),
  })),
  modelProps({
    notes: types.map(Note),
    _sel: nullRef(Note),
  }),
  modelNamed,
)('Root')

const root = Root.create()

export const resetRoot = () => applySnapshot(root, {})

const rootSnap = StorageItem({name: 'rootSnapshot'})
applySnapshot(root, rootSnap.load())
onSnapshot(root, rootSnap.save)

export default hotSnapshot(module)(root)
