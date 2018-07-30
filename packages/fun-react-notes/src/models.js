import {_prop, ascend, indexOf, insert, sortWith} from './little-ramda'
import {
  applySnapshot,
  hotSnapshot,
  idProp,
  nullRef,
  onSnapshot,
  types,
  updateSortIdx,
  values,
} from './little-mst'
import {StorageItem} from './services/storage'
import {setFocusAndSelectionOnDOMId} from './components/utils'

const Note = types
  .model('Note', {
    id: idProp('Note'),
    text: '',
    sortIdx: 0,
  })
  .actions(self => ({
    update(attrs) {
      return Object.assign(self, attrs)
    },
  }))

const Root = types
  .model('Root', {
    notes: types.map(Note),
    _sel: nullRef(Note),
  })
  .views(self => ({
    get notesList() {
      return sortWith([ascend(_prop('sortIdx'))])(values(self.notes))
    },
  }))
  .actions(self => ({
    onAddNote() {
      const idx = 0
      const note = Note.create()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self.notes.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    onAddNoteAfterSelected() {
      const oldIdx = indexOf(self._sel)(self.notesList)
      const idx = oldIdx < 0 ? 0 : oldIdx + 1
      const note = Note.create()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self.notes.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    onAddNoteBeforeSelected() {
      const oldIdx = indexOf(self._sel)(self.notesList)
      const idx = oldIdx < 0 ? 0 : oldIdx
      const note = Note.create()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self.notes.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    updateSelectedOnFocus(sel) {
      self._sel = sel
    },
  }))

const root = Root.create()

export const resetRoot = () => applySnapshot(root, {})

const rootSnap = StorageItem({name: 'rootSnapshot'})
applySnapshot(root, rootSnap.load())
onSnapshot(root, rootSnap.save)

export default hotSnapshot(module)(root)

if (module.hot) {
  window.r = root
}
