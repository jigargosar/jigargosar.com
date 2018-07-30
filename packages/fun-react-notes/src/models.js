import {_compose} from './little-ramda'
import {
  actions,
  applySnapshot,
  hotSnapshot,
  idProp,
  modelAttrs,
  modelNamed,
  modelProps,
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
  modelAttrs({...idProp('Note'), text: ''}),
  modelNamed,
)('Note')

const createNote = () => Note.create({text: 'Note Text'})

const addNote = self => () => self.notes.put(createNote())
const notesList = self => values(self.notes)

const Root = _compose(
  views(self => ({
    get notesList() {
      return notesList(self)
    },
  })),
  actions(self => ({
    addNote: addNote(self),
  })),
  modelProps({notes: types.map(Note)}),
  modelNamed,
)('Root')

const root = Root.create()

const rootSnap = StorageItem({name: 'rootSnapshot'})
applySnapshot(root, rootSnap.load())

hotSnapshot(root, module)

export default root
