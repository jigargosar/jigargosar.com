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

const NoteModel = types
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

const RootStore = types
  .model('RootStore', {
    notes: types.map(NoteModel),
    _sel: nullRef(NoteModel),
  })
  .views(self => ({
    get notesList() {
      return sortWith([ascend(_prop('sortIdx'))])(values(self.notes))
    },
  }))
  .actions(self => ({
    onAddNote() {
      const idx = 0
      const note = NoteModel.create()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self.notes.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    onAddNoteAfterSelected() {
      const oldIdx = indexOf(self._sel)(self.notesList)
      const idx = oldIdx < 0 ? 0 : oldIdx + 1
      const note = NoteModel.create()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self.notes.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    onAddNoteBeforeSelected() {
      const oldIdx = indexOf(self._sel)(self.notesList)
      const idx = oldIdx < 0 ? 0 : oldIdx
      const note = NoteModel.create()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self.notes.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    updateSelectedOnFocus(sel) {
      self._sel = sel
    },
  }))

const store = RootStore.create()

export const reset = () => applySnapshot(store, {})

const rootSnap = StorageItem({name: 'rootSnapshot'})
applySnapshot(store, rootSnap.load())
onSnapshot(store, rootSnap.save)

export default hotSnapshot(module)(store)

if (module.hot) {
  window.s = store
}
