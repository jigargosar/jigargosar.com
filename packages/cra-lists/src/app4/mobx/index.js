import {storage} from '../services/storage'
import {Fire} from './Fire'
import {mReaction} from './utils'

function createNotesCollection() {
  const ncSnapshot = storage.get('ncSnapshot') || {}
  return require('./NoteCollection').NoteCollection.create(ncSnapshot)
}

function createNoteListView(nc) {
  return require('./NoteListView').NoteListView({nc})
}

export function createState() {
  const nc = createNotesCollection()
  const state = {
    nc,
    view: createNoteListView(nc),
    fire: Fire(),
    isAuthKnown() {
      return this.fire.auth.isAuthKnown
    },

    isSignedIn() {
      return this.fire.auth.isSignedIn
    },

    isSignedOut() {
      return this.fire.auth.isSignedOut
    },
  }

  mReaction(
    () => [nc.snapshot],
    () => storage.set('ncSnapshot', nc.snapshot),
  )

  return state
}
