import {_compose} from './little-ramda'
import {
  actions,
  hotSnapshot,
  idProp,
  modelNamed,
  modelProps,
  types,
  updateAttrs,
  views,
} from './little-mst'
import {values} from 'mobx'

const Note = _compose(
  actions(self => ({
    update: updateAttrs(self),
  })),
  modelProps({...idProp('Note'), text: ''}),
  modelNamed,
)('Note')

const createNote = () => Note.create({text: 'Note Text'})

const addNote = self => () => self.notesMap.put(createNote())
const notesList = self => Array.from(values(self.notesMap))

const Root = _compose(
  views(self => ({
    get notesList() {
      return notesList(self)
    },
  })),
  actions(self => ({
    addNote: addNote(self),
  })),
  modelProps({notesMap: types.map(Note)}),
  modelNamed,
)('Root')

const root = Root.create()

localStorage.getItem('rootSnapshot')

hotSnapshot(root, module)

export default root
