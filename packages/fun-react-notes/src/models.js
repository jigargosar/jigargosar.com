import {_compose} from './little-ramda'
import {
  actions,
  idProp,
  modelNamed,
  modelProps,
  types,
  updateAttrs,
  views,
} from './little-mst'

const Note = _compose(
  actions(self => ({
    update: updateAttrs(self),
  })),
  modelProps({...idProp('Note'), text: ''}),
  modelNamed,
)('Note')

export function createNote() {
  return Note.create({text: 'Note Text'})
}

const addNote = self => () => self.notesMap.put(createNote())

const Root = _compose(
  views(self => ({
    get notesList() {
      return Array.from(self.notesMap.values())
    },
  })),
  actions(self => ({
    addNote: addNote(self),
  })),
  modelProps({notesMap: types.map(Note)}),
  modelNamed,
)('Root')

const root = Root.create()

export default root
