import {oObject} from './utils'

export function NoteListView({nc}) {
  return oObject({
    get noteList() {
      return nc.all
    },
  })
}
