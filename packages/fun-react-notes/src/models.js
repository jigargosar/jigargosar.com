import {_compose} from './little-ramda'
import {
  actions,
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

localStorage.getItem('rootSnapshot')

hotSnapshot(root, module)

export default root
