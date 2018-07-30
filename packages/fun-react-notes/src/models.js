import {_compose} from './little-ramda'
import {
  actions,
  idProp,
  modelNamed,
  modelProps,
  updateAttrs,
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
