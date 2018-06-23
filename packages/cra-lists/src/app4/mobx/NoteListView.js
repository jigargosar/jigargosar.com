import {oObject} from './utils'
import {NotesCollection} from './NotesCollection'

export function NoteListView({nc}) {
  return oObject({
    get noteList() {
      return nc.all()
    },
  })
}
