import {storage} from '../services/storage'
import {Fire} from './Fire'
import {mReaction} from './utils'
import {startFireNoteCollectionSync} from './FireNoteCollection'
import {NoteListView} from './NoteListView'
import {NoteCollection} from './NoteCollection'

function createNotesCollection() {
  const ncSnapshot = storage.get('ncSnapshot') || {}
  return NoteCollection.create(ncSnapshot)
}

export function createState() {
  const nc = createNotesCollection()
  const state = {
    nc,
    view: NoteListView({nc}),
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

  const disposer = startFireNoteCollectionSync(state)

  mReaction(
    () => [nc.snapshot],
    () => storage.set('ncSnapshot', nc.snapshot),
  )

  return {...state, disposer}
}
