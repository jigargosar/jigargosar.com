import {_compose, _path} from './little-ramda'
import {
  actions,
  idProp,
  modelNamed,
  modelProps,
  types,
  updateAttrs,
  views,
} from './little-mst'
import {applySnapshot, getSnapshot} from 'mobx-state-tree'

const Note = _compose(
  actions(self => ({
    update: updateAttrs(self),
  })),
  modelProps({...idProp('Note'), text: ''}),
  modelNamed,
)('Note')

const createNote = () => Note.create({text: 'Note Text'})

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

if (module.hot) {
  const snap = _path(['hot', 'data', 'snap'])(module)
  if (snap) {
    applySnapshot(root, snap)
  }

  module.hot.dispose(data => {
    data.snap = getSnapshot(root)
  })
}

export default root
