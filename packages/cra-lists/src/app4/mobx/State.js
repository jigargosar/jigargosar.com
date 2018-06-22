import {oObject} from './utils'
import {NoteStore} from './NoteStore'

export function State() {
  return oObject({ns: NoteStore()})
}
