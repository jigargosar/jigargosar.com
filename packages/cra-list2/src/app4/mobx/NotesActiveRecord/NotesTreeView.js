import {
  createObservableObject,
  createTransformer,
} from '../little-mobx'
import {_, isNotNil} from '../../little-ramda'
import {
  findAllChildrenOfNote,
  findParentNoteOrNull,
  getOrUpsertRootNote,
} from './NotesActiveRecord'

const treeNoteTransformer = createTransformer(note => {
  return createObservableObject({
    props: {
      get note() {
        return note
      },
      get parentNote() {
        return findParentNoteOrNull(note)
      },
      get children() {
        return findAllChildrenOfNote(note).map(treeNoteTransformer)
      },
      get parent() {
        if (_.isNil(note.parentId)) {
          return null
        }
        return treeNoteTransformer(this.parentNote)
      },
    },
    actions: {},
    name: 'TreeNoteNode',
  })
})

function NotesTreeView() {
  return createObservableObject({
    props: {
      rootNote: null,
    },
    actions: {
      initRoot() {
        this.rootNote = getOrUpsertRootNote()

        console.assert(isNotNil(this.rootNote))
      },
    },
    name: 'NotesTreeView',
  })
}

const notesTreeView = NotesTreeView()

const notesTree = notesTreeView

export {notesTreeView, notesTree}
