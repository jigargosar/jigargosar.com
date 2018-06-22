import {oObject} from './utils'
import {NotesCollection} from './NotesCollection'

export function State() {
  return oObject({nc: NotesCollection()})
}
