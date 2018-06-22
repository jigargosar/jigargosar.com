import {oObject} from './utils'
import {NotesCollection} from './NotesCollection'

export function State() {
  return oObject({nc: NotesCollection.create()})
}

export function ViewState(state = State()) {
  return oObject({
    get noteList() {
      return state.nc.all()
    },
  })
}
