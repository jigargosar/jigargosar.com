import {_prop, ascend, indexOf, insert, sortWith} from './little-ramda'
import {
  addDisposer,
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
    _noteMap: types.map(NoteModel),
    _sel: nullRef(NoteModel),
  })
  .extend(self => ({
    views: {
      get _notes() {
        return values(self._noteMap)
      },
    },
  }))
  .actions(self => {
    const ls = StorageItem({name: 'rootSnapshot'})
    return {
      loadFromLS() {
        applySnapshot(self, ls.load())
      },
      reset() {
        applySnapshot(self, {})
      },
      saveToLSOnSnapshotChange() {
        addDisposer(self, onSnapshot(self, ls.save))
      },
    }
  })
  .views(self => ({
    get notesList() {
      return sortWith([ascend(_prop('sortIdx'))])(self._notes)
    },
  }))
  .actions(self => ({
    onAddNote() {
      const idx = 0
      const note = NoteModel.create()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self._noteMap.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    onAddNoteAfterSelected() {
      const oldIdx = indexOf(self._sel)(self.notesList)
      const idx = oldIdx < 0 ? 0 : oldIdx + 1
      const note = NoteModel.create()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self._noteMap.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    onAddNoteBeforeSelected() {
      const oldIdx = indexOf(self._sel)(self.notesList)
      const idx = oldIdx < 0 ? 0 : oldIdx
      const note = NoteModel.create()

      updateSortIdx(insert(idx)(note)(self.notesList))
      self._noteMap.put(note)
      setFocusAndSelectionOnDOMId(note.id)
    },
    updateSelectedOnFocus(sel) {
      self._sel = sel
    },
  }))

const store = RootStore.create()

store.loadFromLS()
store.saveToLSOnSnapshotChange()

export default hotSnapshot(module)(store)

if (module.hot) {
  window.s = store
}
