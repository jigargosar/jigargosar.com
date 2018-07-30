import {_compose} from './little-ramda'
import {
  actions,
  idProp,
  modelNamed,
  modelProps,
  updateAttrs,
} from './little-mst'

const NoteM = _compose(
  actions(self => ({
    update: updateAttrs(self),
  })),
  modelProps({...idProp('Note'), text: ''}),
  modelNamed,
)('Note')

export function createNote() {
  return NoteM.create({text: 'Note Text'})
}
