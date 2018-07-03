import {storage} from '../services/storage'
import {mReaction} from './utils'

function createNotesCollection() {
  const ncSnapshot = storage.get('ncSnapshot') || {}
  return require('./NoteCollection').NoteCollection.create(ncSnapshot)
}

function createNoteListView(nc) {
  return require('./NoteListView').NoteListView({nc})
}

function createFireNoteCollection(state) {
  return require('./FireNoteCollection').FireNoteCollection(state)
}

function createFire() {
  return require('./Fire').Fire()
}

export function createState() {
  const nc = createNotesCollection()
  const state = {
    nc,
    view: createNoteListView(nc),
    fire: createFire(),
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

  createFireNoteCollection(state)

  mReaction(
    () => [nc.snapshot],
    () => storage.set('ncSnapshot', nc.snapshot),
  )

  return state
}
